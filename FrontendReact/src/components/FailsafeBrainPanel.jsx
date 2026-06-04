function FailsafeBrainPanel({
  data,
  consensusContribution = "LOADING",
  consensusInfluence = 0,
  escalationLevel = "NONE",
}) {
  const riskScore = Math.round((data?.confidence || 0) * 100);

  return (
    <div className="panel brain-panel failsafe-brain-card">
      <h2>Failsafe Brain</h2>
      <p>Risk Intelligence & Protection Systems</p>

      <div className="brain-metrics">
        <div>
          <span>Protection State</span>
          <strong>{data?.status || "STANDBY"}</strong>
        </div>
        
      <div className="brain-status">
         <span className="brain-pulse"></span>
          PROTECTING
        </div>

        <div>
          <span>Escalation Level</span>
          <strong>{escalationLevel}</strong>
        </div>

        <div>
          <span>Risk Score</span>
          <strong>{`${riskScore}%`}</strong>
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

export default FailsafeBrainPanel;
