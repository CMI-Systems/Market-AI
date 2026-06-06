import "../styles/ClosedBetaPages.css";

function Subscriptions() {
  return (
    <div className="closed-beta-page">
      <header className="closed-beta-header">
        <span className="closed-beta-version">AICC Closed Beta v0.1</span>
        <h1>CLOSED BETA ACCESS</h1>
        <p>Access status, beta entitlement, and future plan visibility.</p>
      </header>

      <section className="closed-beta-summary-grid">
        <div className="closed-beta-card">
          <span>Current Plan</span>
          <strong>CLOSED BETA</strong>
        </div>
        <div className="closed-beta-card">
          <span>Billing</span>
          <strong>DISABLED</strong>
        </div>
        <div className="closed-beta-card">
          <span>Provider Access</span>
          <strong>BETA ENABLED</strong>
        </div>
        <div className="closed-beta-card">
          <span>Pricing</span>
          <strong>NOT ACTIVE</strong>
        </div>
      </section>

      <section className="closed-beta-grid">
        <div className="closed-beta-panel">
          <h2>Future Plans</h2>
          <div className="closed-beta-list">
            <div>
              <span>Individual</span>
              <strong>FUTURE RELEASE</strong>
            </div>
            <div>
              <span>Pro</span>
              <strong>FUTURE RELEASE</strong>
            </div>
            <div>
              <span>Institutional</span>
              <strong>FUTURE RELEASE</strong>
            </div>
          </div>
        </div>

        <div className="closed-beta-panel">
          <h2>Access Notice</h2>
          <p>
            Pricing is not active during closed beta. Subscription controls are
            intentionally disabled while AICC validates cognition, provider
            resilience, alerts, replay, and signal workflows.
          </p>
          <p className="closed-beta-disclaimer">
            For research and intelligence purposes only. Not financial advice.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Subscriptions;
