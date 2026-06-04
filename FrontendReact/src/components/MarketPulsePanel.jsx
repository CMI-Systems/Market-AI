function MarketPulsePanel({ confidence, liquidityPressure, institutionalFlow }) {
  return (
    <div className="panel">
      <h2>Market Pulse</h2>
      <p>Real-Time Market Heartbeat</p>

      <div className="brain-metrics">
        <div>
          <span>Trend</span>
          <strong>{confidence?.level || "LOADING"}</strong>
        </div>

        <div>
          <span>Momentum</span>
          <strong>{confidence?.consensusStrength || confidence?.level || "LOADING"}</strong>
        </div>

        <div>
          <span>Liquidity</span>
          <strong>{liquidityPressure?.liquidityState || "LOADING"}</strong>
        </div>

        <div>
          <span>Pulse Score</span>
          <strong>{Math.round((confidence?.score || 0) * 100)}</strong>
        </div>
      </div>
    </div>
  );
}

export default MarketPulsePanel;
