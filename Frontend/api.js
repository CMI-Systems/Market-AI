import { CONFIG } from "../config.js";

async function fetchJSON(url) {
  const res = await fetch(url);
  return res.json();
}

export const API = {
  health: () => fetchJSON(`${CONFIG.API}/api/health`),
  watchlist: () => fetchJSON(`${CONFIG.API}/api/watchlist`),
  anomalies: () => fetchJSON(`${CONFIG.API}/api/anomalies`),
  summary: () => fetchJSON(`${CONFIG.API}/api/summary`),
  chart: (symbol) => fetchJSON(`${CONFIG.API}/api/chart/${symbol}`)
};