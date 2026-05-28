/*
 * Appends evaluated Shadow Training entries to category-specific JSONL files.
 * JSONL keeps one JSON object per line so future tools can stream the datasets.
 */

const fs = require("fs");
const path = require("path");
const {
  getSandboxTrainingPath,
  isTestSandboxEnabled
} = require("../services/testSandbox");

const DATASET_FILES = {
  momentum: "momentum.jsonl",
  anomaly: "anomaly.jsonl",
  risk: "risk.jsonl",
  behavior: "behavior.jsonl",
  volatility: "volatility.jsonl",
  regime: "regime.jsonl"
};

const DATASET_DIRECTORY = path.join(__dirname, "datasets");

function getDatasetDirectory() {
  return isTestSandboxEnabled()
    ? getSandboxTrainingPath("datasets")
    : DATASET_DIRECTORY;
}

function getDatasetPath(category) {
  const fileName = DATASET_FILES[category];

  if (!fileName) {
    throw new Error(`Unsupported training category: ${category}`);
  }

  return path.join(getDatasetDirectory(), fileName);
}

function ensureDatasetFile(category) {
  const datasetDirectory = getDatasetDirectory();
  const datasetPath = getDatasetPath(category);

  fs.mkdirSync(datasetDirectory, { recursive: true });

  if (!fs.existsSync(datasetPath)) {
    fs.writeFileSync(datasetPath, "", { flag: "wx" });
  }

  return datasetPath;
}

function appendTrainingEntry(entry) {
  if (!entry || typeof entry !== "object") {
    throw new Error("Training entry must be an object.");
  }

  const datasetPath = ensureDatasetFile(entry.category);
  const jsonlLine = `${JSON.stringify(entry)}\n`;

  fs.appendFileSync(datasetPath, jsonlLine, { encoding: "utf8", flag: "a" });

  return {
    appended: true,
    category: entry.category,
    datasetPath
  };
}

module.exports = {
  DATASET_FILES,
  appendTrainingEntry,
  ensureDatasetFile,
  getDatasetDirectory,
  getDatasetPath
};
