/*
 * Local diagnostic script for model readiness gates.
 * It reads current JSONL datasets and confirms no category is production-ready yet.
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  getCategoryReadiness
} = require("../training/modelReadiness");

const CATEGORIES = [
  "momentum",
  "anomaly",
  "risk",
  "behavior",
  "volatility",
  "regime"
];

const DATASET_DIRECTORY = path.join(__dirname, "..", "training", "datasets");

function readJsonlEntries(category) {
  const datasetPath = path.join(DATASET_DIRECTORY, `${category}.jsonl`);

  if (!fs.existsSync(datasetPath)) {
    return [];
  }

  const lines = fs.readFileSync(datasetPath, "utf8")
    .split(/\r?\n/)
    .filter(line => line.trim());

  return lines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch {
      throw new Error(
        `Invalid JSONL in ${category}.jsonl on line ${index + 1}.`
      );
    }
  });
}

function printReadiness(readiness) {
  console.log(`\n${readiness.category}`);
  console.log(`  readiness score: ${readiness.readinessScore}`);
  console.log(`  production ready: ${readiness.ready}`);
  console.log(`  sample count: ${readiness.metrics.sampleCount}`);
  console.log(`  reviewed count: ${readiness.metrics.reviewedSampleCount}`);
  console.log(`  high-quality labels: ${readiness.metrics.highQualityLabelCount}`);
  console.log(`  noisy labels: ${readiness.labels.noisy}`);
  console.log(`  wrong labels: ${readiness.labels.wrong}`);
}

function run() {
  console.log("Model readiness diagnostic");

  CATEGORIES.forEach((category) => {
    const entries = readJsonlEntries(category);
    const readiness = getCategoryReadiness(category, entries);

    assert.strictEqual(
      readiness.ready,
      false,
      `${category} should not be production-ready yet.`
    );

    printReadiness(readiness);
  });

  console.log("\nNo categories are production-ready yet.");
  console.log("Model readiness diagnostic passed.");
}

run();
