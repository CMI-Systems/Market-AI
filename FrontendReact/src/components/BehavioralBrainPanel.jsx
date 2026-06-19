function BehavioralBrainPanel({
  data,
  consensusContribution = "LOADING",
  consensusInfluence = 0,
}) {
  return (
    <div className="panel brain-panel behavioral-brain-card">
      <h2>Behavioral Brain</h2>
      <p>Human Intelligence & Psychology</p>

      <div className="brain-metrics">
        <div>
          <span>Discipline State</span>
          <strong>{data?.status || "DATA_UNAVAILABLE"}</strong>
        </div>
      <div className="brain-status">
         <span className="brain-pulse"></span>
         {data?.status || "DATA_UNAVAILABLE"}
        </div>

        <div>
          <span>Behavioral Risk</span>
          <strong>{data?.bias === "ALIGNED" ? "CONTAINED" : data?.bias || "DATA_UNAVAILABLE"}</strong>
        </div>

        <div>
          <span>Crowd Alignment</span>
          <strong>{data?.bias || "DATA_UNAVAILABLE"}</strong>
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

export default BehavioralBrainPanel;
