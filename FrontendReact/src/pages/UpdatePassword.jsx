import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearPasswordRecoveryPending,
  getAuthSession,
  hasPasswordRecoveryUrlHint,
  isPasswordRecoveryPending,
  setPasswordRecoveryPending,
  signOutOperator,
  supabase,
} from "../services/supabaseClient";
import "../styles/Auth.css";

const RECOVERY_HYDRATION_TIMEOUT_MS = 5000;
const RECOVERY_HYDRATION_RETRY_MS = 150;

function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("CHECKING");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let retryTimer = null;
    let timeoutTimer = null;

    function clearTimers() {
      if (retryTimer) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
      }

      if (timeoutTimer) {
        window.clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
    }

    function markInvalid(message) {
      clearPasswordRecoveryPending();
      setStatus("INVALID");
      setError(message);
    }

    async function verifyRecoverySession({ final = false } = {}) {
      const recoveryHintPresent = hasPasswordRecoveryUrlHint();

      if (recoveryHintPresent) {
        setPasswordRecoveryPending();
      }

      const recoveryPending = recoveryHintPresent || isPasswordRecoveryPending();
      let result;

      try {
        result = await getAuthSession();
      } catch {
        if (active) {
          clearTimers();
          setStatus("ERROR");
          setError("The password recovery session could not be verified.");
        }
        return true;
      }

      if (!active) return true;

      if (result.error) {
        clearTimers();
        setStatus("ERROR");
        setError("The password recovery session could not be verified.");
        return true;
      }

      if (result.configured && result.session && recoveryPending) {
        clearTimers();
        setStatus("READY");
        setError("");
        return true;
      }

      if (!final) return false;

      clearTimers();

      if (!recoveryPending) {
        markInvalid("No active password recovery request was found.");
        return true;
      }

      markInvalid("The password recovery link is missing or has expired.");
      return true;
    }

    function scheduleRetry() {
      retryTimer = window.setTimeout(async () => {
        const resolved = await verifyRecoverySession();
        if (!active || resolved) return;
        scheduleRetry();
      }, RECOVERY_HYDRATION_RETRY_MS);
    }

    if (!supabase) {
      retryTimer = window.setTimeout(() => {
        if (!active) return;
        setStatus("ERROR");
        setError("The password recovery session could not be verified.");
      }, 0);

      return () => {
        active = false;
        clearTimers();
      };
    }

    const recoveryHintPresent = hasPasswordRecoveryUrlHint();

    if (recoveryHintPresent) {
      setPasswordRecoveryPending();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecoveryPending();
        void verifyRecoverySession();
      }
    });

    void verifyRecoverySession().then((resolved) => {
      if (!active || resolved) return;
      scheduleRetry();
    });

    timeoutTimer = window.setTimeout(() => {
      void verifyRecoverySession({ final: true });
    }, RECOVERY_HYDRATION_TIMEOUT_MS);

    return () => {
      active = false;
      clearTimers();
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmation) {
      setError("The password confirmation does not match.");
      return;
    }

    if (!supabase || !isPasswordRecoveryPending()) {
      setStatus("INVALID");
      setError("The password recovery session is unavailable.");
      return;
    }

    setStatus("UPDATING");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setStatus("READY");
        setError("The password could not be updated. Request a new recovery link if this link has expired.");
        return;
      }

      const { error: signOutError } = await signOutOperator();

      if (signOutError) {
        setPasswordRecoveryPending();
        setStatus("ERROR");
        setError("The password was updated, but the recovery session could not be closed. Try signing out again.");
        return;
      }

      clearPasswordRecoveryPending();
      navigate("/login", {
        replace: true,
        state: { passwordUpdated: true },
      });
    } catch {
      setPasswordRecoveryPending();
      setStatus("ERROR");
      setError("The password recovery request could not be completed.");
    }
  }

  async function handleReturnToLogin() {
    const { error: signOutError } = await signOutOperator();

    if (signOutError) {
      setStatus("ERROR");
      setError("The recovery session could not be closed.");
      return;
    }

    clearPasswordRecoveryPending();
    navigate("/login", { replace: true });
  }

  if (status === "CHECKING") {
    return (
      <div className="auth-page">
        <section className="auth-card">
          <span>AICC ACCOUNT RECOVERY</span>
          <h1>Verifying Recovery Session</h1>
          <p>Waiting for the password recovery session to initialize.</p>
        </section>
      </div>
    );
  }

  const canUpdate = status === "READY" || status === "UPDATING";

  return (
    <div className="auth-page">
      <section className="auth-card auth-login-card">
        <span>AICC ACCOUNT RECOVERY</span>
        <h1>Update Password</h1>
        <p>
          {canUpdate
            ? "Create a new password before returning to AICC operator login."
            : "This recovery request cannot continue. Return to login and request a new recovery link."}
        </p>

        {canUpdate ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              New Password
              <input
                autoComplete="new-password"
                disabled={status === "UPDATING"}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>

            <label>
              Confirm New Password
              <input
                autoComplete="new-password"
                disabled={status === "UPDATING"}
                minLength={8}
                onChange={(event) => setConfirmation(event.target.value)}
                type="password"
                value={confirmation}
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button disabled={status === "UPDATING"} type="submit">
              {status === "UPDATING" ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : (
          <div className="auth-form">
            {error && <p className="auth-error">{error}</p>}
            <button type="button" onClick={handleReturnToLogin}>
              Return to Login
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default UpdatePassword;
