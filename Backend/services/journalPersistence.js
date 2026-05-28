/*
 * Local JSON persistence for Trading Journal drafts.
 * Each journal draft is saved as its own structured file for future review.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const {
  getSandboxDataPath,
  isTestSandboxEnabled
} = require("./testSandbox");

const JOURNAL_DIRECTORY = path.join(__dirname, "..", "data", "journals");
let idCounter = 0;

function getJournalDirectory() {
  return isTestSandboxEnabled()
    ? getSandboxDataPath("journals")
    : JOURNAL_DIRECTORY;
}

function ensureJournalDirectory() {
  const journalDirectory = getJournalDirectory();

  fs.mkdirSync(journalDirectory, { recursive: true });
  return journalDirectory;
}

function safeString(value, fallback = "") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function safeTimestamp(value, fallbackDate = new Date()) {
  const parsed = value ? new Date(value) : fallbackDate;

  return Number.isNaN(parsed.getTime())
    ? fallbackDate.toISOString()
    : parsed.toISOString();
}

function safeList(values) {
  return Array.isArray(values)
    ? values.filter((value) => typeof value === "string" && value.trim())
    : [];
}

function createJournalId() {
  idCounter += 1;

  return `journal-${Date.now()}-${idCounter}-${crypto.randomBytes(4).toString("hex")}`;
}

function journalPath(id) {
  if (!/^[A-Za-z0-9_-]+$/.test(id || "")) {
    return null;
  }

  return path.join(getJournalDirectory(), `${id}.json`);
}

function toSavedJournal(journalDraft, id) {
  const now = new Date();

  return {
    id,
    draftType: safeString(journalDraft?.draftType, "REFLECTION"),
    symbol: safeString(journalDraft?.symbol, "UNKNOWN"),
    mood: safeString(journalDraft?.mood, "UNKNOWN"),
    tags: safeList(journalDraft?.tags),
    prompts: safeList(journalDraft?.prompts),
    summary: safeString(journalDraft?.summary),
    createdAt: safeTimestamp(journalDraft?.createdAt, now),
    savedAt: now.toISOString()
  };
}

function readJournalFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function listJournalFiles() {
  const journalDirectory = getJournalDirectory();

  if (!fs.existsSync(journalDirectory)) {
    return [];
  }

  return fs.readdirSync(journalDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => path.join(journalDirectory, fileName));
}

function saveJournalDraft(journalDraft = {}) {
  ensureJournalDirectory();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const id = createJournalId();
    const filePath = journalPath(id);
    const savedJournal = toSavedJournal(journalDraft, id);

    try {
      // wx avoids overwriting any existing journal file.
      fs.writeFileSync(filePath, JSON.stringify(savedJournal, null, 2), {
        encoding: "utf8",
        flag: "wx"
      });

      return {
        saved: true,
        journalId: id,
        journal: savedJournal,
        filePath
      };
    } catch (error) {
      if (error.code !== "EEXIST" || attempt === 2) {
        return {
          saved: false,
          journalId: null,
          error: "journal_save_failed"
        };
      }
    }
  }

  return {
    saved: false,
    journalId: null,
    error: "journal_save_failed"
  };
}

function getJournalDraftById(id) {
  const filePath = journalPath(id);

  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  return readJournalFile(filePath);
}

function getRecentJournalDrafts(options = {}) {
  const limit = Number.isInteger(options.limit) && options.limit > 0
    ? options.limit
    : Number.MAX_SAFE_INTEGER;
  const symbol = safeString(options.symbol).toUpperCase();
  const mood = safeString(options.mood).toUpperCase();
  const tag = safeString(options.tag).toLowerCase();

  return listJournalFiles()
    .map(readJournalFile)
    .filter(Boolean)
    .filter((journal) => {
      const symbolMatches = !symbol || journal.symbol?.toUpperCase() === symbol;
      const moodMatches = !mood || journal.mood?.toUpperCase() === mood;
      const tagMatches = !tag || journal.tags?.some((journalTag) => {
        return journalTag.toLowerCase() === tag;
      });

      return symbolMatches && moodMatches && tagMatches;
    })
    .sort((first, second) => {
      return new Date(second.savedAt).getTime() - new Date(first.savedAt).getTime();
    })
    .slice(0, limit);
}

function countValues(journals, field) {
  return journals.reduce((counts, journal) => {
    const value = journal[field] || "UNKNOWN";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function getJournalStats() {
  const journals = getRecentJournalDrafts();
  const tags = journals.reduce((counts, journal) => {
    (journal.tags || []).forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });

    return counts;
  }, {});

  return {
    totalJournals: journals.length,
    moods: countValues(journals, "mood"),
    tags,
    symbols: countValues(journals, "symbol")
  };
}

function clearJournalStorage() {
  listJournalFiles().forEach((filePath) => {
    fs.unlinkSync(filePath);
  });

  return {
    cleared: true,
    totalJournals: 0
  };
}

module.exports = {
  JOURNAL_DIRECTORY,
  clearJournalStorage,
  getJournalDirectory,
  getJournalDraftById,
  getJournalStats,
  getRecentJournalDrafts,
  saveJournalDraft
};
