import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearPasswordRecoveryPending,
  hasPasswordRecoveryUrlHint,
  isPasswordRecoveryPending,
  setPasswordRecoveryPending,
  signOutOperator,
  updateOperatorPassword,
  waitForPasswordRecoverySession,
} from "../services/supabaseClient";
import "../styles/Auth.css";

const MIN_PASSWORD_LENGTH = 8;

function UpdatePassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState("CHECKING");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function verifyRecoverySession() {
      setStatus("CHECKING");
      setError("");

      if (hasPasswordRecoveryUrlHint()) {
        setPasswordRecoveryPending();
      }

      const result = await waitForPasswordRecoverySession();

      if (!active) return;

      if (result.error) {
        setStatus("ERROR");
        setError("The password recovery session could not be verified.");
        return;
      }

      if (result.session && (isPasswordRecoveryPending() || hasPasswordRecoveryUrlHint())) {
        setStatus("READY");
        setError("");
        return;
      }

      clearPasswordRecoveryPending();
      setStatus("INVALID");
      setError(
        result.timedOut
          ? "The password recovery link is missing, expired, or could not be initialized."
          : "No active password recovery request was found."
      );
    }

    void verifyRecoverySession();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (status !== "READY") {
      setStatus("INVALID");
      setError("The password recovery session is unavailable.");
      return;
    }

    if (!isPasswordRecoveryPending() && !hasPasswordRecoveryUrlHint()) {
      setStatus("INVALID");
      setError("The password recovery session is unavailable.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmation) {
      setError("The password confirmation does not match.");
      return;
    }

    setStatus("UPDATING");

    const { error: updateError } = await updateOperatorPassword(password);

    if (updateError) {
      setStatus("READY");
      setError(
        "The password could not be updated. Request a new recovery link if this link has expired."
      );
      return;
    }

    clearPasswordRecoveryPending();

    const { error: signOutError } = await signOutOperator();

    if (signOutError) {
      setStatus("ERROR");
      setError(
        "The password was updated, but the recovery session could not be closed. Return to login and sign in again."
      );
      return;
    }

    navigate("/login", {
      replace: true,
      state: { passwordUpdated: true },
    });
  }

  async function handleReturnToLogin() {
    clearPasswordRecoveryPending();

    await signOutOperator();

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
                minLength={MIN_PASSWORD_LENGTH}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>

            <label>
              Confirm New Password
              <input
                autoComplete="new-password"
                disabled={status === "UPDATING"}
                minLength={MIN_PASSWORD_LENGTH}
                onChange={(event) => setConfirmation(event.target.value)}
                required
                type="password"
                value={confirmation}
              />
            </label>

            {error ? <p className="auth-error">{error}</p> : null}

            <button disabled={status === "UPDATING"} type="submit">
              {status === "UPDATING" ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : (
          <div className="auth-form">
            {error ? <p className="auth-error">{error}</p> : null}
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