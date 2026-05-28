const fs = require("fs");
const path = require("path");

const AWAITING_COGNITION_NODES = "Awaiting cognition nodes.";
const DEFAULT_NODE_DIR = path.join(__dirname, "..", "data", "distributed-nodes");
const NODE_FILE = "nodes.json";

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function nodePath(baseDir = DEFAULT_NODE_DIR) {
  return path.join(baseDir, NODE_FILE);
}

function readNodes(baseDir = DEFAULT_NODE_DIR) {
  try {
    const file = nodePath(baseDir);
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, "utf8")).nodes || [];
  } catch {
    const corruptDir = path.join(baseDir, "corrupted");
    ensureDir(corruptDir);
    try {
      fs.renameSync(nodePath(baseDir), path.join(corruptDir, `nodes-${Date.now()}.corrupt`));
    } catch {
      // Startup recovery continues even if isolation fails.
    }
    return [];
  }
}

function writeNodes(nodes, baseDir = DEFAULT_NODE_DIR) {
  ensureDir(baseDir);
  fs.writeFileSync(nodePath(baseDir), `${JSON.stringify({ nodes }, null, 2)}\n`);
}

function registerNode(node = {}, options = {}) {
  const baseDir = options.baseDir || DEFAULT_NODE_DIR;
  const nodes = readNodes(baseDir);
  const now = new Date().toISOString();
  const nodeId = node.nodeId || "local-cognition-node";
  const nextNode = {
    nodeId,
    role: node.role || "coordinator",
    region: node.region || "local",
    uptime: Number(node.uptime || 0),
    status: node.status || "ACTIVE",
    synchronizationState: node.synchronizationState || "SYNCHRONIZED",
    lastHeartbeat: now
  };
  const nextNodes = nodes.filter((item) => item.nodeId !== nodeId).concat(nextNode);
  writeNodes(nextNodes, baseDir);
  return nextNode;
}

function heartbeatNode(nodeId = "local-cognition-node", options = {}) {
  const baseDir = options.baseDir || DEFAULT_NODE_DIR;
  const nodes = readNodes(baseDir);
  const found = nodes.find((node) => node.nodeId === nodeId);
  if (!found) return registerNode({ nodeId }, { baseDir });
  found.lastHeartbeat = new Date().toISOString();
  found.uptime = Number(found.uptime || 0) + 1;
  writeNodes(nodes, baseDir);
  return found;
}

function buildNodeRegistry(options = {}) {
  const baseDir = options.baseDir || DEFAULT_NODE_DIR;
  ensureDir(baseDir);
  let nodes = readNodes(baseDir);
  if (!nodes.length && options.initialize !== false) {
    registerNode({ nodeId: "local-cognition-node", role: "coordinator", region: "local" }, { baseDir });
    nodes = readNodes(baseDir);
  }

  return {
    nodeState: nodes.length ? "ACTIVE" : "UNKNOWN",
    nodes,
    warnings: [],
    summary: nodes.length ? `${nodes.length} cognition nodes registered.` : AWAITING_COGNITION_NODES
  };
}

module.exports = {
  AWAITING_COGNITION_NODES,
  DEFAULT_NODE_DIR,
  buildNodeRegistry,
  heartbeatNode,
  registerNode
};
