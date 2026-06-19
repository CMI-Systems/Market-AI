import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  getAuthSession,
  isSupabaseConfigured,
  isPasswordRecoveryPending,
  setPasswordRecoveryPending,
  signOutOperator,
  supabase,
} from "../services/supabaseClient";
import { getCurrentOperator } from "../services/operatorProfileService";
import "../styles/Auth.css";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const [authState, setAuthState] = useState({
    checking: true,
    configured: isSupabaseConfigured,
    session: null,
    operator: null,
    recoveryPending: false,
  });

  useEffect(() => {
    let active = true;
    let requestSequence = 0;

    async function resolveAuthorization({ configured, session }) {
      const requestId = ++requestSequence;

      if (!active) return;

      if (!configured || !session) {
        setAuthState({
          checking: false,
          configured,
          session: null,
          operator: null,
          recoveryPending: false,
        });
        return;
      }

      if (isPasswordRecoveryPending()) {
        setAuthState({
          checking: false,
          configured: true,
          session,
          operator: null,
          recoveryPending: true,
        });
        return;
      }

      setAuthState({
        checking: true,
        configured: true,
        session,
        operator: null,
        recoveryPending: false,
      });

      const operator = await getCurrentOperator(session);

      if (!active || requestId !== requestSequence) return;

      setAuthState({
        checking: false,
        configured: true,
        session,
        operator,
        recoveryPending: false,
      });
    }

    async function loadSession() {
      let result;

      try {
        result = await getAuthSession();
      } catch (error) {
        const code =
          typeof error?.code === "string" ? error.code : "UNKNOWN";
        console.error("AICC session validation failed.", { code });
        await resolveAuthorization({
          configured: isSupabaseConfigured,
          session: null,
        });
        return;
      }

      if (!active) return;

      if (result.error) {
        const code =
          typeof result.error.code === "string"
            ? result.error.code
            : "UNKNOWN";
        console.error("AICC session validation failed.", { code });
        await resolveAuthorization({
          configured: result.configured,
          session: null,
        });
        return;
      }

      await resolveAuthorization({
        configured: result.configured,
        session: result.session,
      });
    }

    loadSession();

    if (!supabase) {
      return () => {
        active = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecoveryPending();
      }

      setTimeout(() => {
        if (!active) return;

        void resolveAuthorization({
          configured: true,
          session,
        });
      }, 0);
    });

    return () => {
      active = false;
      requestSequence += 1;
      subscription.unsubscribe();
    };
  }, []);

  if (authState.checking) {
    return (
      <div className="auth-page">
        <section className="auth-card">
          <span>AICC CLOSED BETA</span>
          <h1>Checking Operator Session</h1>
          <p>Validating closed-beta access.</p>
        </section>
      </div>
    );
  }

  if (!authState.configured || !authState.session) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (authState.recoveryPending || isPasswordRecoveryPending()) {
    return <Navigate replace to="/update-password" />;
  }

  const operator = authState.operator;

  if (!operator?.authenticated || !operator.betaApproved) {
    const authorizationUnavailable =
      operator?.authorizationState === "QUERY_ERROR";

    return (
      <div className="auth-page">
        <section className="auth-card auth-access-pending-card">
          <span>AICC CLOSED BETA</span>
          <h1>
            {authorizationUnavailable
              ? "Authorization Check Unavailable"
              : "Closed Beta Access Pending"}
          </h1>
          <p>
            {authorizationUnavailable
              ? "AICC could not verify the protected operator profile. Access remains blocked."
              : "Your operator account is authenticated, but its protected profile is missing, pending, or not consistently approved."}
          </p>

          <div className="auth-pending-grid">
            <div>
              <span>Operator Session</span>
              <strong>
                {operator?.authenticated ? "Authenticated" : "Unavailable"}
              </strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{operator?.betaStatus || "AUTHORIZATION_UNAVAILABLE"}</strong>
            </div>
          </div>

          <button type="button" onClick={signOutOperator}>
            Logout
          </button>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="auth-operator-bar">
        <div className="auth-operator-identity">
          <div>
            <span>Operator</span>
            <strong>{operator.displayName}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{operator.betaStatus}</strong>
          </div>
        </div>
        <button type="button" onClick={signOutOperator}>
          Logout
        </button>
      </div>
      {children}
    </>
  );
}

export default ProtectedRoute;
