function CrisisManagementPanel({ data }) {
  return (
    <div className="panel crisis-panel">
      <h2>CRISIS</h2>
      <strong>{data?.stability || "LOADING"}</strong>
      <p>{data?.warnings?.[0] || data?.summary || "Awaiting crisis cognition."}</p>
    </div>
  );
}

export default CrisisManagementPanel;
