function InstitutionalAccumlationPanel({ data }) {
  return (
    <div className="panel accumulation-panel">
      <h2>INSTITUTIONAL ACCUMULATION</h2>
      <strong>{data?.flowState || "LOADING"}</strong>
      <p>{data?.summary || "Awaiting institutional flow cognition."}</p>
    </div>
  );
}

export default InstitutionalAccumlationPanel;
