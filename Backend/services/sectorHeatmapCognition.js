/*
 * Sector heatmap cognition for Market AI.
 * Converts mapped ecosystem regions into visualization-safe sector state.
 */

const AWAITING_HEATMAP = "Awaiting sector heatmap cognition.";

function safeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === "object")
    : [];
}

function heatmapStateForRegion(region = {}) {
  if (region.fragmentation === true || region.state === "FRAGMENTED") return "FRAGMENTING";
  if (region.state === "ESCALATING" || region.pressure === "SEVERE") return "VOLATILE";
  if (region.state === "RECOVERING" || region.trajectory === "RECOVERING") return "RECOVERING";
  if (region.state === "CAUTION" || region.pressure === "MODERATE") return "CAUTION";
  if (region.state === "STABLE" || region.pressure === "LOW") return "STABLE";
  return "UNKNOWN";
}

function confidenceForRegion(region = {}) {
  if (region.pressure === "SEVERE" || region.fragmentation === true) return "LOW";
  if (region.pressure === "HIGH" || region.state === "ESCALATING") return "MODERATE";
  if (region.state === "RECOVERING" || region.pressure === "MODERATE") return "MODERATE";
  if (region.state === "STABLE" || region.pressure === "LOW") return "HIGH";
  return "UNKNOWN";
}

function aggregateHeatmapState(sectors = []) {
  if (!sectors.length) return "UNKNOWN";
  if (sectors.some((sector) => sector.stability === "VOLATILE")) return "VOLATILE";
  if (sectors.some((sector) => sector.stability === "FRAGMENTING")) return "FRAGMENTING";
  if (sectors.some((sector) => sector.stability === "CAUTION")) return "CAUTION";
  if (sectors.some((sector) => sector.stability === "RECOVERING")) return "RECOVERING";
  if (sectors.every((sector) => sector.stability === "STABLE")) return "STABLE";
  return "UNKNOWN";
}

function awaitingSectorHeatmap() {
  return {
    heatmapState: "UNKNOWN",
    sectors: [],
    warnings: [],
    summary: AWAITING_HEATMAP
  };
}

function buildSectorHeatmap(input = {}) {
  const regions = safeArray(input.strategicEnvironmentMap?.ecosystemRegions);

  if (!regions.length) {
    return awaitingSectorHeatmap();
  }

  const sectors = regions.map((region) => ({
    ecosystem: region.ecosystem || "UNKNOWN",
    stability: heatmapStateForRegion(region),
    pressure: region.pressure || "UNKNOWN",
    synchronization: region.synchronization || "UNKNOWN",
    fragmentation: region.fragmentation === true,
    trajectory: region.trajectory || "UNKNOWN",
    confidence: confidenceForRegion(region)
  }));
  const heatmapState = aggregateHeatmapState(sectors);
  const warnings = [];

  if (sectors.some((sector) => sector.fragmentation)) {
    warnings.push("Sector heatmap contains fragmented ecosystem regions.");
  }

  if (sectors.some((sector) => ["HIGH", "SEVERE"].includes(sector.pressure))) {
    warnings.push("Sector pressure intensity is elevated in at least one region.");
  }

  return {
    heatmapState,
    sectors,
    warnings,
    summary: `${heatmapState} sector heatmap across ${sectors.length} ecosystem regions.`
  };
}

module.exports = {
  AWAITING_HEATMAP,
  awaitingSectorHeatmap,
  buildSectorHeatmap
};
