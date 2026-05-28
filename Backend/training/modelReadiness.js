/*
 * Provides placeholder readiness gates for future model work.
 * It measures reviewed dataset quality only; it does not train or call a model.
 */

const DEFAULT_THRESHOLDS = {
  minimumSamples: 100,
  minimumReviewedSamples: 25,
  minimumHighQualitySamples: 15,
  maximumNoisyWrongRate: 0.25
};

function countLabels(entries) {
  return entries.reduce((counts, entry) => {
    const label = entry?.qualityLabel?.label;

    if (label && Object.prototype.hasOwnProperty.call(counts, label)) {
      counts[label] += 1;
    }

    return counts;
  }, {
    unreviewed: 0,
    useful: 0,
    noisy: 0,
    wrong: 0,
    high_quality: 0
  });
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function ratio(value, target) {
  if (!target) return 1;
  return Math.min(value / target, 1);
}

function getCategoryReadiness(category, entries = [], thresholds = {}) {
  const categoryEntries = entries.filter(entry => entry?.category === category);
  const labels = countLabels(categoryEntries);
  const reviewedSampleCount = categoryEntries.filter(
    entry => entry?.qualityLabel?.reviewed === true
  ).length;
  const noisyWrongCount = labels.noisy + labels.wrong;
  const noisyWrongRate = reviewedSampleCount
    ? noisyWrongCount / reviewedSampleCount
    : 0;

  const limits = {
    ...DEFAULT_THRESHOLDS,
    ...thresholds
  };

  const sampleProgress = ratio(categoryEntries.length, limits.minimumSamples);
  const reviewProgress = ratio(
    reviewedSampleCount,
    limits.minimumReviewedSamples
  );
  const qualityProgress = ratio(
    labels.high_quality,
    limits.minimumHighQualitySamples
  );
  const noiseProgress = reviewedSampleCount
    ? Math.max(0, 1 - noisyWrongRate / limits.maximumNoisyWrongRate)
    : 0;

  const readinessScore = clampScore(
    sampleProgress * 25 +
    reviewProgress * 25 +
    qualityProgress * 35 +
    noiseProgress * 15
  );

  const ready =
    categoryEntries.length >= limits.minimumSamples &&
    reviewedSampleCount >= limits.minimumReviewedSamples &&
    labels.high_quality >= limits.minimumHighQualitySamples &&
    noisyWrongRate <= limits.maximumNoisyWrongRate;

  return {
    category,
    ready,
    readinessScore,
    metrics: {
      sampleCount: categoryEntries.length,
      reviewedSampleCount,
      highQualityLabelCount: labels.high_quality,
      noisyWrongLabelCount: noisyWrongCount,
      noisyWrongRate: Number(noisyWrongRate.toFixed(4))
    },
    labels,
    thresholds: limits
  };
}

module.exports = {
  DEFAULT_THRESHOLDS,
  getCategoryReadiness
};
