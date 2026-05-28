/*
 * Behavioral timeline reader for persisted Trading Journal drafts.
 * It projects saved reflection drafts into deterministic review history.
 */

const {
  getRecentJournalDrafts
} = require("./journalPersistence");

function safeJournals(journals) {
  return Array.isArray(journals) ? journals : getRecentJournalDrafts();
}

function cloneTags(tags) {
  return Array.isArray(tags) ? [...tags] : [];
}

function toTimelineEvent(journal = {}) {
  return {
    id: journal.id,
    timestamp: journal.savedAt || journal.createdAt,
    symbol: journal.symbol || "UNKNOWN",
    mood: journal.mood || "UNKNOWN",
    tags: cloneTags(journal.tags),
    summary: journal.summary || ""
  };
}

function sortTimeline(timeline, newestFirst) {
  return [...timeline].sort((first, second) => {
    const firstTime = new Date(first.timestamp).getTime() || 0;
    const secondTime = new Date(second.timestamp).getTime() || 0;

    return newestFirst
      ? secondTime - firstTime
      : firstTime - secondTime;
  });
}

function buildBehavioralTimeline(input = {}) {
  const newestFirst = input.newestFirst !== false;
  const limit = Number.isInteger(input.limit) && input.limit > 0
    ? input.limit
    : Number.MAX_SAFE_INTEGER;

  return sortTimeline(
    safeJournals(input.journals).map(toTimelineEvent),
    newestFirst
  ).slice(0, limit);
}

function getBehavioralTimelineBySymbol(symbol, input = {}) {
  const normalizedSymbol = typeof symbol === "string"
    ? symbol.trim().toUpperCase()
    : "";

  return buildBehavioralTimeline(input).filter((event) => {
    return !normalizedSymbol || event.symbol.toUpperCase() === normalizedSymbol;
  });
}

function getBehavioralTimelineByMood(mood, input = {}) {
  const normalizedMood = typeof mood === "string"
    ? mood.trim().toUpperCase()
    : "";

  return buildBehavioralTimeline(input).filter((event) => {
    return !normalizedMood || event.mood.toUpperCase() === normalizedMood;
  });
}

function countBy(events, field) {
  return events.reduce((distribution, event) => {
    const key = event[field] || "UNKNOWN";
    distribution[key] = (distribution[key] || 0) + 1;
    return distribution;
  }, {});
}

function countTags(events) {
  return events.reduce((distribution, event) => {
    event.tags.forEach((tag) => {
      distribution[tag] = (distribution[tag] || 0) + 1;
    });

    return distribution;
  }, {});
}

function dominantKey(distribution) {
  return Object.entries(distribution)
    .sort((first, second) => {
      if (second[1] === first[1]) {
        return first[0].localeCompare(second[0]);
      }

      return second[1] - first[1];
    })[0]?.[0] || "NONE";
}

function dominantTags(tagDistribution) {
  const topCount = Math.max(0, ...Object.values(tagDistribution));

  if (!topCount) {
    return [];
  }

  return Object.entries(tagDistribution)
    .filter(([, count]) => count === topCount)
    .map(([tag]) => tag)
    .sort();
}

function buildObservations(timeline, dominantMood, topTags) {
  if (!timeline.length) {
    return ["No persisted journal history is available for behavioral review."];
  }

  const observations = [
    `${timeline.length} persisted journal drafts are available for behavioral review.`
  ];

  if (dominantMood !== "NONE") {
    observations.push(`Dominant journal mood is ${dominantMood}.`);
  }

  if (topTags.length) {
    observations.push(`Most frequent journal tags are ${topTags.join(", ")}.`);
  }

  return observations;
}

function summarizeBehavioralTimeline(timeline = []) {
  const safeTimeline = Array.isArray(timeline) ? timeline : [];
  const moodDistribution = countBy(safeTimeline, "mood");
  const tagDistribution = countTags(safeTimeline);
  const dominantMood = dominantKey(moodDistribution);
  const topTags = dominantTags(tagDistribution);
  const symbolsReviewed = [...new Set(
    safeTimeline
      .map((event) => event.symbol)
      .filter((symbol) => typeof symbol === "string" && symbol.trim())
  )];

  return {
    totalEvents: safeTimeline.length,
    dominantMood,
    dominantTags: topTags,
    symbolsReviewed,
    moodDistribution,
    tagDistribution,
    observations: buildObservations(safeTimeline, dominantMood, topTags)
  };
}

module.exports = {
  buildBehavioralTimeline,
  getBehavioralTimelineByMood,
  getBehavioralTimelineBySymbol,
  summarizeBehavioralTimeline
};
