/*
 * Test-only storage sandbox helpers.
 * Diagnostics can opt in with MARKET_AI_TEST_SANDBOX=true so local data stays clean.
 */

const fs = require("fs");
const path = require("path");

const BACKEND_DIRECTORY = path.join(__dirname, "..");
const SANDBOX_DIRECTORY = path.join(BACKEND_DIRECTORY, ".sandbox");

function isTestSandboxEnabled() {
  return String(process.env.MARKET_AI_TEST_SANDBOX).toLowerCase() === "true";
}

function getSandboxDataPath(...segments) {
  return path.join(SANDBOX_DIRECTORY, "data", ...segments);
}

function getSandboxTrainingPath(...segments) {
  return path.join(SANDBOX_DIRECTORY, "training", ...segments);
}

function restoreSandboxEnvironment(previousValue) {
  if (previousValue === undefined) {
    delete process.env.MARKET_AI_TEST_SANDBOX;
    return;
  }

  process.env.MARKET_AI_TEST_SANDBOX = previousValue;
}

function withTestSandbox(callback) {
  const previousValue = process.env.MARKET_AI_TEST_SANDBOX;

  process.env.MARKET_AI_TEST_SANDBOX = "true";

  try {
    const result = callback();

    if (result && typeof result.then === "function") {
      return result.finally(() => {
        restoreSandboxEnvironment(previousValue);
      });
    }

    restoreSandboxEnvironment(previousValue);
    return result;
  } catch (error) {
    restoreSandboxEnvironment(previousValue);
    throw error;
  }
}

function clearTestSandbox() {
  // This path is fixed to Backend/.sandbox so real development data is untouched.
  fs.rmSync(SANDBOX_DIRECTORY, {
    recursive: true,
    force: true
  });

  return {
    cleared: true,
    sandboxPath: SANDBOX_DIRECTORY
  };
}

module.exports = {
  clearTestSandbox,
  getSandboxDataPath,
  getSandboxTrainingPath,
  isTestSandboxEnabled,
  withTestSandbox
};
