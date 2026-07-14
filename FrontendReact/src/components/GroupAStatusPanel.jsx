import { useEffect, useState } from "react";
import ProviderHealthCard from "./ProviderHealthCard";
import MarketContextDigestCard from "./MarketContextDigestCard";
import {
  fetchLatestMarketContextDigest,
  fetchProviderHealth,
} from "../services/GroupAReadApi";
import { createLoadingState } from "../services/GroupAReadContracts";

function GroupAStatusPanel() {
  const [providerHealth, setProviderHealth] = useState(createLoadingState());
  const [latestDigest, setLatestDigest] = useState(createLoadingState());
  const [lastCheckedAt, setLastCheckedAt] = useState(null);

  async function loadGroupAStatus() {
    setProviderHealth((current) => ({
      ...current,
      uiState: "loading",
      message: "Checking approved provider health service.",
    }));
    setLatestDigest((current) => ({
      ...current,
      uiState: "loading",
      message: "Checking approved market context digest service.",
    }));

    const [providerResult, digestResult] = await Promise.all([
      fetchProviderHealth(),
      fetchLatestMarketContextDigest(),
    ]);

    setProviderHealth(providerResult);
    setLatestDigest(digestResult);
    setLastCheckedAt(new Date().toISOString());
  }

  useEffect(() => {
    let active = true;

    async function load() {
      const [providerResult, digestResult] = await Promise.all([
        fetchProviderHealth(),
        fetchLatestMarketContextDigest(),
      ]);

      if (!active) return;

      setProviderHealth(providerResult);
      setLatestDigest(digestResult);
      setLastCheckedAt(new Date().toISOString());
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="command-section group-a-status-section">
      <div className="group-a-section-header">
        <div>
          <span className="mission-eyebrow">Approved Read Services</span>
          <h2>Group A Status</h2>
          <p>
            Read-only provider health and market context digest views. No execution,
            autonomy, or learning controls are exposed.
          </p>
        </div>
        <div className="group-a-section-meta">
          <span>Backend DTOs</span>
          <strong>{lastCheckedAt ? "CHECKED" : "PENDING"}</strong>
        </div>
      </div>

      <div className="group-a-status-grid">
        <ProviderHealthCard response={providerHealth} onRefresh={loadGroupAStatus} />
        <MarketContextDigestCard response={latestDigest} onRefresh={loadGroupAStatus} />
      </div>
    </section>
  );
}

export default GroupAStatusPanel;
