import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  getAuthSession,
  isSupabaseConfigured,
  isPasswordRecoveryPending,
  signInOperator,
} from "../services/supabaseClient";
import "../styles/Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const result = await getAuthSession();

      if (!active) return;

      setSession(result.session);
      setIsChecking(false);
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signInOperator({ email, password });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message || "Unable to verify closed-beta access.");
      return;
    }

    navigate(from, { replace: true });
  }

  if (isChecking) {
    return (
      <div className="auth-page">
        <section className="auth-card">
          <span>AICC CLOSED BETA</span>
          <h1>Checking Access</h1>
          <p>Looking for an existing operator session.</p>
        </section>
      </div>
    );
  }

  if (session) {
    if (isPasswordRecoveryPending()) {
      return <Navigate replace to="/update-password" />;
    }

    return <Navigate replace to={from} />;
  }

  return (
    <div className="auth-page">
      <section className="auth-card auth-login-card">
        <span>AICC CLOSED BETA</span>
        <h1>Operator Login</h1>
        <p>
          Access is limited to approved closed-beta operators. Use the credentials assigned
          to your Supabase operator account.
        </p>

        {!isSupabaseConfigured && (
          <div className="auth-notice">
            <strong>Access Gate Placeholder</strong>
            <p>
              Supabase is not configured in this environment. Add
              VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable operator login.
            </p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              autoComplete="email"
              disabled={!isSupabaseConfigured || isSubmitting}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="operator@example.com"
              type="email"
              value={email}
            />
          </label>

          <label>
            Password
            <input
              autoComplete="current-password"
              disabled={!isSupabaseConfigured || isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Closed-beta password"
              type="password"
              value={password}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button disabled={!isSupabaseConfigured || isSubmitting} type="submit">
            {isSubmitting ? "Verifying..." : "Enter AICC"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default Login;
