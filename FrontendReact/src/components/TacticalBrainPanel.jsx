function TacticalBrainPanel({
  data,
  consensusContribution = "LOADING",
  consensusInfluence = 0,
}) {
  const confidenceScore = Math.round((data?.confidence || 0) * 100);

  return (
    <div className="panel brain-panel tactical-brain-card">
      <h2>Tactical Brain</h2>
      <p>Market Intelligence & Opportunity Analysis</p>

    <div className="brain-status">
       <span className="brain-pulse"></span>
        ANALYZING
      </div>

      <div className="brain-metrics">
        <div>
          <span>Bias</span>
          <strong>{data?.bias || "NEUTRAL"}</strong>
        </div>

        <div>
          <span>Signal State</span>
          <strong>{data?.status || "OBSERVING"}</strong>
        </div>

        <div>
          <span>Confidence</span>
          <strong>{`${confidenceScore}%`}</strong>
        </div>

        <div>
          <span>Consensus Contribution</span>
          <strong>{consensusContribution}</strong>
        </div>
      </div>

      <div className="consensus-influence">
        <span>Consensus Influence</span>
        <strong>{consensusInfluence}%</strong>
        <div className="consensus-influence-track">
          <i style={{ width: `${consensusInfluence}%` }}></i>
        </div>
      </div>
    </div>
  );
}

export default TacticalBrainPanel;
