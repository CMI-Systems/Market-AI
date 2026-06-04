function VolatilityCompressionPanel({ data }) {
  return (
    <div className="panel compression-panel">
      <h2>VOLATILITY COMPRESSION</h2>
      <strong>{data?.liquidityState || "LOADING"}</strong>
      <p>{data?.summary || "Awaiting liquidity pressure cognition."}</p>
    </div>
  );
}

export default VolatilityCompressionPanel;
