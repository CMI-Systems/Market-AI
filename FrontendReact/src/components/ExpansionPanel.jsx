function ExpansionPanel({ data }) {
  return (
    <div className="panel expansion-panel">
      <h2>EXPANSION</h2>
      <strong>{data?.environment || "LOADING"}</strong>
      <p>{data?.summary || "Awaiting strategic environment cognition."}</p>
    </div>
  );
}

export default ExpansionPanel;
