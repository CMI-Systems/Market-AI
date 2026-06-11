import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  getAuthSession,
  isSupabaseConfigured,
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
  });

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const result = await getAuthSession();

      if (!active) return;

      setAuthState({
        checking: false,
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      setAuthState({
        checking: false,
        configured: true,
        session,
      });
    });

    return () => {
      active = false;
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

  const operator = getCurrentOperator(authState.session);

  if (!operator.authenticated || !operator.betaApproved) {
    return (
      <div className="auth-page">
        <section className="auth-card auth-access-pending-card">
          <span>AICC CLOSED BETA</span>
          <h1>Closed Beta Access Pending</h1>
          <p>
            Your operator account is authenticated, but it has not been approved
            for AICC closed beta access yet.
          </p>

          <div className="auth-pending-grid">
            <div>
              <span>Operator Email</span>
              <strong>{operator.email || "Unknown operator"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{operator.betaStatus}</strong>
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
