/*
 * Interactive region engine for Market AI.
 * Produces frontend-safe drilldown summaries for core ecosystem regions.
 */

const AWAITING_REGION_COGNITION = "Awaiting region cognition.";
const DEFAULT_REGIONS = ["Broad Market", "Mega Caps", "Semiconductors"];

function state(value, fallback = "UNKNOWN") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function regionFromGroup(group = {}) {
  return group.ecosystem || group.group || group.name || "UNKNOWN";
}

function evaluateInteractiveRegions(input = {}) {
  const ecosystemGroups = Array.isArray(input.crossSymbolEcosystem?.ecosystemGroups)
    ? input.crossSymbolEcosystem.ecosystemGroups
    : [];
  const mapRegions = Array.isArray(input.strategicEnvironmentMap?.ecosystemRegions)
    ? input.strategicEnvironmentMap.ecosystemRegions
    : [];
  const heatmapSectors = Array.isArray(input.sectorHeatmap?.sectors)
    ? input.sectorHeatmap.sectors
    : [];

  if (!ecosystemGroups.length && !mapRegions.length && !heatmapSectors.length) {
    return {
      regionState: "LIMITED",
      regions: [],
      synchronization: "UNKNOWN",
      driftSignals: [],
      dominantRegion: null,
      warnings: [],
      summary: AWAITING_REGION_COGNITION
    };
  }

  const sourceNames = new Set(DEFAULT_REGIONS);
  ecosystemGroups.forEach((group) => sourceNames.add(regionFromGroup(group)));
  mapRegions.forEach((region) => sourceNames.add(region.ecosystem));
  heatmapSectors.forEach((sector) => sourceNames.add(sector.ecosystem));

  const regions = [...sourceNames].filter(Boolean).map((name) => {
    const mapped = mapRegions.find((region) => region.ecosystem === name) || {};
    const heat = heatmapSectors.find((sector) => sector.ecosystem === name) || {};
    const group = ecosystemGroups.find((item) => regionFromGroup(item) === name) || {};
    const pressure = state(mapped.pressure || heat.pressure);
    const synchronization = state(mapped.synchronization || heat.synchronization || group.synchronization);
    const drift = ["HIGH", "SEVERE"].includes(pressure) || ["FRAGMENTED", "LOW"].includes(synchronization);

    return {
      region: name,
      state: state(mapped.state || heat.stability || group.state),
      synchronization,
      pressure,
      replayAlignment: drift ? "DRIFT_REVIEW" : "ALIGNED",
      confidence: state(heat.confidence || group.confidence),
      summary: `${name} region shows ${state(mapped.state || heat.stability || group.state)} state with ${pressure} pressure.`
    };
  });
  const driftSignals = regions
    .filter((region) => region.replayAlignment === "DRIFT_REVIEW")
    .map((region) => `${region.region} requires replay alignment review.`);
  const dominantRegion = regions.slice().sort((a, b) => {
    const rank = { SEVERE: 4, HIGH: 3, MODERATE: 2, LOW: 1, UNKNOWN: 0 };
    return (rank[b.pressure] || 0) - (rank[a.pressure] || 0);
  })[0] || null;
  const fragmented = regions.filter((region) => ["FRAGMENTED", "LOW"].includes(region.synchronization)).length;
  const synchronization = fragmented ? "PARTIAL" : "SYNCHRONIZED";

  return {
    regionState: fragmented >= 2 ? "FRAGMENTED" : "STRUCTURED",
    regions,
    synchronization,
    driftSignals,
    dominantRegion,
    warnings: driftSignals.length ? ["One or more ecosystem regions show drift pressure."] : [],
    summary: `${regions.length} interactive cognition regions are available.`
  };
}

module.exports = {
  AWAITING_REGION_COGNITION,
  evaluateInteractiveRegions
};
