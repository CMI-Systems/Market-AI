# AICC Phase P.7 - Global Scan Audit

Date: 2026-06-16

Mode: AUDIT FIRST with targeted Global Scan fixes

Result: PASS with PARTIAL product readiness.

## Executive Summary

P.7 audited the Global Scan route, page, data sources, scan scope, ranking, metrics, provider boundaries, session/freshness handling, chart handoff, and unavailable-state behavior.

Confirmed defects were found and fixed:

- The page claimed regional/global market status for North America, Europe, Asia, Middle East, and South America without certified global-market provider data.
- The page displayed market breadth fields such as advancers, decliners, new highs, and new lows from generic cognition confidence/liquidity values.
- The page did not perform a real multi-symbol provider scan.
- No scan universe, ranking formula, provider, source type, timestamp, data age, session state, validation status, or quality label was visible per symbol.
- Missing confidence could become a valid-looking numeric score through `Math.round((confidence?.score || 0) * 100)`.
- Scan refresh had no stale-response protection.
- The page had no chart handoff for selected scan results.

P.7 now implements a bounded US equities multi-symbol scan across the certified Alpaca REST scope using the existing `chartDataService.getValidatedChartData()` path. It ranks rows only when validated quote/candle context is available, explicitly labels unsupported global/breadth/macro/Webull capabilities as `NOT IMPLEMENTED`, and uses `MarketPriceChart` for selected-symbol chart context.

No unsupported global-market provider, breadth provider, macro provider, Webull path, live trading, order-entry control, provider credential change, Supabase schema/RLS change, simulation fallback, training, Shadow Trainer, Brain Learning, deployment change, or production change was made.

## Feature Inventory

| Capability | State | Evidence |
|---|---|---|
| Scan universe | COMPLETE | Fixed universe: `SPY`, `QQQ`, `NVDA`, `AAPL`, `MSFT`. |
| Multi-symbol scanning | COMPLETE | Runs `getValidatedChartData()` across bounded universe. |
| Symbol count | COMPLETE | Summary shows universe size. |
| Search | COMPLETE | Symbol text filter. |
| Filtering | PARTIAL | Symbol filter only. |
| Sorting | COMPLETE | Sort by rank, score, change, symbol, or status. |
| Ranking | COMPLETE | Deterministic score/rank formula with unavailable rows rank-limited. |
| Score | COMPLETE | Derived only when validated inputs exist. |
| Trend | COMPLETE | Derived from validated recent candles. |
| Momentum | PARTIAL | Derived from trend/change signal state. |
| Volatility | COMPLETE | Derived from validated candle range. |
| Liquidity | PARTIAL | Uses average volume availability, not real market depth. |
| Volume | COMPLETE | Average volume from validated candles. |
| Change | COMPLETE | Quote change from validated quote. |
| Percent change | COMPLETE | Quote change percent from validated quote. |
| Regime | NOT_IMPLEMENTED | No direct regime engine output on this page. |
| Tactical state | PARTIAL | Derived scan state only; direct Tactical Brain is not invoked. |
| Behavioral state | NOT_IMPLEMENTED | Not connected. |
| Failsafe state | PARTIAL | Limited/blocking derived from validation status. |
| Signal state | PARTIAL | Local scan signal classification from validated change/trend. |
| Provider | COMPLETE | Row-level provider displayed. |
| Source type | COMPLETE | Row-level source type displayed. |
| Timestamp | COMPLETE | Row-level provider timestamp displayed. |
| Data age | COMPLETE | Row-level data age displayed. |
| Session state | COMPLETE | Row-level session state displayed. |
| Validation status | COMPLETE | Row-level validation status displayed. |
| Quality label | COMPLETE | Row-level quality label displayed. |
| Chart handoff | COMPLETE | Selecting a row updates `MarketPriceChart`. |
| Watchlist handoff | NOT_IMPLEMENTED | No add-to-watchlist workflow in P.7. |
| Refresh | COMPLETE | Manual refresh available. |
| Auto-refresh | NOT_IMPLEMENTED | Not added; manual scan only. |
| Empty state | COMPLETE | Empty/filter state visible. |
| Error state | COMPLETE | Backend/provider failures become unavailable rows. |
| Pagination or virtualization | NOT_IMPLEMENTED | Not needed for 5-symbol bounded universe. |

Global Scan Capabilities Identified: 34.

Complete Capabilities: 22.

Partial Capabilities: 7.

Missing Capabilities: 5.

## Naming/Scope Audit

Implemented scope: `US_EQUITIES_MULTI_SYMBOL`.

The product route/name remains `Global Scan`, but the page now states:

`US Equities Scan - Alpaca validated scope`

Unsupported global-market, market-breadth, sector-breadth, macro, and Webull data are explicitly labeled `NOT IMPLEMENTED`.

## Scan Universe Audit

Current universe:

- `SPY`
- `QQQ`
- `NVDA`
- `AAPL`
- `MSFT`

Universe source: bounded hardcoded certified-scope list.

Integrity controls:

- Symbols are normalized to uppercase.
- Duplicates are removed.
- Empty symbols are removed.
- Invalid characters are stripped.
- Universe is capped at 12 symbols; current list is 5.
- Unsupported assets are not included.
- Scope is visible to the operator.

Universe Integrity: PASS.

## Source Audit

| Source | Classification | Notes |
|---|---|---|
| Alpaca quote data via backend market routes | VALIDATED_RAW | Accessed through `chartDataService`. |
| Alpaca candle/bar data via backend market routes | VALIDATED_RAW | Required for rankable rows. |
| Backend provider/session metadata | VALIDATED_RAW / EXPLICIT_UNAVAILABLE_STATE | Propagated through chart-data result. |
| `chartDataService` validation | DERIVED_FROM_VALIDATED_RAW | Rejects unsafe records before rows rank. |
| Local scan ranking formula | DERIVED_FROM_VALIDATED_RAW | Uses validated change, trend, volatility, quality. |
| Market breadth/global/macro/Webull | EXPLICIT_UNAVAILABLE_STATE | Shown as not implemented. |
| Cognition global/sector labels | REMOVED_FROM_RUNTIME | No longer drive Global Scan rows. |

Validated Data Sources: 4.

Placeholder/Unknown Sources: 1.

## Canonical Result Contract

Implemented scan row contract:

```js
{
  symbol,
  rank,
  score,
  trend,
  momentum,
  volatility,
  liquidity,
  volume,
  change,
  percentChange,
  regime,
  tacticalState,
  behavioralState,
  failsafeState,
  signalState,
  provider,
  sourceType,
  timestamp,
  receivedAt,
  dataAge,
  sessionState,
  validationStatus,
  qualityLabel,
  available,
  simulated,
  generated,
  provenance,
  warnings
}
```

Required behavior verified:

- Missing score remains `UNAVAILABLE`.
- Missing timestamp remains `UNAVAILABLE`.
- Unknown provider/source does not produce a ranked row.
- Unsupported fields remain `NOT_IMPLEMENTED` or `UNAVAILABLE`.
- Simulated/generated rows are blocked by the chart adapter and do not rank.

## Ranking Integrity

Ranking formula:

- Start from 50.
- Add bounded quote change contribution: `changePercent * 5`, clamped from `-20` to `+20`.
- Add quality contribution: `(qualityScore - 75) * 0.3`.
- Add 8 for validated recent candle uptrend.
- Subtract 8 for validated recent candle downtrend.
- Subtract 10 for high recent candle range over 4%.
- Clamp final score to 1-100.

Ranking controls:

- Rows with blocked/unavailable validation statuses receive `score: null`.
- Rows with missing quote change or quality score receive `score: null`.
- Unranked rows sort below ranked rows.
- Ties sort by symbol.
- Unsupported metrics do not inflate score.
- Failsafe-blocked rows cannot rank above validated rows.

Ranking Integrity: PASS.

## Metric Integrity

| Metric | Source | Result |
|---|---|---|
| Trend | Validated candles | PASS. |
| Momentum | Validated change + trend | PARTIAL. |
| Volatility | Validated candles | PASS. |
| Liquidity | Validated average volume availability | PARTIAL; no depth source. |
| Volume | Validated candles | PASS. |
| Change / percent change | Validated quote | PASS. |
| Regime | None | NOT_IMPLEMENTED. |
| Tactical/Behavioral/Failsafe | Derived/local only | PARTIAL/NOT_IMPLEMENTED. |

Metric Integrity: PASS within certified scan scope; PARTIAL for broader intelligence integration.

## Concurrency Audit

Current scan concurrency:

- Maximum current universe: 5 symbols.
- Hard cap: 12 normalized symbols.
- Uses one `Promise.allSettled()` batch.
- One symbol failure does not crash the full scan.
- Failed symbols become unavailable rows.
- Request ID guard prevents stale scans from overwriting newer scans.
- Manual refresh prevents uncontrolled polling.

Concurrency Safety: PASS.

## Provider/Capability Integrity

Provider controls:

- Uses existing backend provider routes through `chartDataService`.
- Webull is not used.
- Unknown providers are rejected by chart-data normalization.
- Simulated/generated records are rejected.
- Unsupported global/index/macro/breadth capabilities are shown as not implemented.
- Market closure remains a session/data-state condition, not a provider failure.

Provider Integrity: PASS.

## Session/Freshness

Displayed:

- Timestamp.
- Data age.
- Session state.
- Source type.
- Validation status.
- Quality label.

Rows can show:

- `MARKET_CLOSED`
- `STALE`
- `PARTIAL`
- `PROVIDER_OFFLINE`
- `DATA_UNAVAILABLE`
- `BLOCKED`

Session/Freshness: PASS.

## Scan Lifecycle

Implemented states:

- `IDLE`
- `LOADING`
- `READY`
- `PARTIAL`
- `DATA_UNAVAILABLE`
- `EMPTY`

Represented through row status:

- `DEGRADED`
- `STALE`
- `MARKET_CLOSED`
- `PROVIDER_OFFLINE`
- `BACKEND_UNAVAILABLE`
- `BLOCKED`

Scan Lifecycle: PARTIAL.

Missing:

- Explicit `CANCELLED` lifecycle display.
- Persisted scan history.

## Filtering/Sorting

Implemented:

- Symbol search.
- Sort by rank.
- Sort by score.
- Sort by change.
- Sort by symbol.
- Sort by status.

Missing:

- Filters for trend, momentum, volatility, liquidity, signal, regime, freshness, provider.

Filtering/Sorting: PARTIAL.

## Chart/Watchlist Integration

Chart:

- Selecting a scan row updates `MarketPriceChart`.
- Chart uses the selected row's validated candles/quote/provenance.
- Timeframe changes rescan and update chart context.
- Prior chart data is not relabeled under a new symbol because selected chart data comes from the selected row.

Watchlists:

- No add-to-watchlist handoff in P.7.

Chart/Watchlist Integration: PARTIAL.

## Signals/Alerts/Market Pulse Integration

Signals:

- Scan does not consume blocked signal objects as confirmation.
- Signal state is local and derived from validated quote/candle scan inputs.

Alerts:

- No direct scan-to-alert event generation.

Market Pulse:

- Scope now matches P.6: Alpaca quote/candle boundary.
- Global Scan no longer presents single-symbol or cognition-only data as global breadth.

Signals/Alerts/Market Pulse Integration: PARTIAL.

## Operator Workflow

| Workflow Step | Result |
|---|---|
| Open Global Scan | PASS; protected route exists. |
| Understand scan universe | PASS; scope and symbols are visible. |
| Start/refresh scan | PASS. |
| View loading state | PASS. |
| Review ranked results | PASS. |
| Inspect provenance/freshness | PASS. |
| Filter and sort | PARTIAL; symbol filter and sort implemented. |
| Select symbol | PASS. |
| Open chart | PASS; chart embedded. |
| Add to Watchlists | NOT_IMPLEMENTED. |
| Understand partial/degraded results | PASS. |
| Navigate to Signals/Tactical | PARTIAL; global navigation only. |

Operator Workflow: PARTIAL.

## UI State Integrity

Supported states:

- `IDLE`
- `LOADING`
- `READY`
- `PARTIAL`
- `DEGRADED`
- `STALE`
- `MARKET_CLOSED`
- `PROVIDER_OFFLINE`
- `BACKEND_UNAVAILABLE`
- `DATA_UNAVAILABLE`
- `EMPTY`
- `BLOCKED`

No state now claims full global coverage without evidence.

## Responsive Findings

Responsive Safety: PASS.

Evidence:

- Header controls wrap.
- Summary grid collapses from 3 columns to 2 and then 1.
- Main layout collapses from two columns to one.
- Results table collapses to two columns on mobile.
- Long provider/status labels wrap.
- Chart wrapper respects page width.

Authenticated visual QA remains limited by the lack of a valid local Supabase operator session.

## Accessibility Findings

Accessibility: PARTIAL.

Implemented:

- Labeled controls.
- Text status values, not color-only.
- Results use table roles.
- Row selection uses buttons with accessible labels.
- Chart component has its own accessible title and summary.

Remaining:

- Mobile collapsed row labels are visual/positional, not full accessible per-cell labels.
- No live-region announcement for scan completion.

## Performance Findings

Performance Safety: PASS.

Evidence:

- Universe is bounded.
- No auto-refresh or interval loop.
- `Promise.allSettled()` prevents one failed symbol from crashing the scan.
- Request ID guard ignores stale refreshes.
- No unbounded result growth.
- No duplicated polling was introduced.

## Scenario Matrix

| Scenario | Expected | Result |
|---|---|---|
| Valid multi-symbol scan | READY with validated ranked rows | PASS. |
| One invalid symbol | Row unavailable/omitted; scan continues | PASS by normalization/unavailable row path. |
| One provider error | Partial scan, no fabricated row | PASS. |
| Empty universe | EMPTY | PASS by lifecycle logic. |
| Duplicate symbols | Deduplicated | PASS. |
| Invalid OHLC for one symbol | Blocked or excluded row | PASS through chart adapter. |
| Stale row | STALE/degraded and rank-limited | PASS. |
| Mixed provider result | Blocked/conflict warning | PASS through chart adapter. |
| Unknown source | Blocked | PASS. |
| Simulated/generated row | Blocked | PASS. |
| Market closed | MARKET_CLOSED/CACHED, not provider failure | PASS through provenance state. |
| Backend unavailable | BACKEND_UNAVAILABLE/DATA_UNAVAILABLE | PASS. |
| Rapid refresh | Latest scan wins | PASS via request ID guard. |
| Sort by score | Numeric ordering | PASS. |
| Mobile viewport | No broken layout expected | PASS by responsive CSS; authenticated visual QA pending. |

## Validation Results

Commands/checks run:

```powershell
npm.cmd run build
node -e "require('./routes/marketRoutes'); require('./routes/cognitionRoutes'); require('./services/marketDataValidator'); require('./services/marketProviderService'); console.log('backend module load ok');"
```

Results:

- Frontend build: PASS.
- Backend route/module load: PASS.
- Protected `/global-scan` smoke: PASS; unauthenticated access redirected safely to `/login`.
- In-app browser console errors during protected-route smoke: 0.
- Root mount check: PASS.
- Visible `NaN`: not found.
- Visible `undefined`: not found.
- Dev server cleanup: PASS; no active listener remained on port `5174`.

## Defects Found

1. CRITICAL: Page claimed global regional status without certified global-market provider data.
2. HIGH: Page displayed cognition confidence as market breadth/new-high/new-low values.
3. HIGH: Page did not perform a real multi-symbol scan.
4. HIGH: No row-level provider/source/timestamp/session/validation/quality provenance was visible.
5. HIGH: Missing confidence could become a valid-looking numeric breadth score.
6. MODERATE: No deterministic ranking formula was documented or visible in code.
7. MODERATE: No stale-response guard existed.
8. MODERATE: No chart handoff existed for scan rows.
9. LOW: Styling used decorative gradient backgrounds and less constrained mobile behavior.

## Exact Fixes

Modified:

- `FrontendReact/src/pages/GlobalScan.jsx`
- `FrontendReact/src/styles/GlobalScan.css`
- `docs/product-surface/P7_GLOBAL_SCAN_AUDIT.md`

Changes:

- Rebuilt Global Scan around a bounded US equities universe.
- Added `getValidatedChartData()` scan flow.
- Added deterministic ranking and score rules.
- Added symbol search and sorting.
- Added row-level provider/source/timestamp/data-age/session/validation/quality display.
- Added selected-row `MarketPriceChart`.
- Added explicit unsupported capability panel.
- Added stale-response protection through a request ID.
- Removed false regional/global/breadth displays.
- Removed zero-default breadth score path.
- Reworked responsive layout.

## Remaining Gaps

- No real global-market provider data.
- No market breadth provider data.
- No macro data.
- No Webull data.
- No direct Regime/Tactical/Behavioral/Failsafe integration per row.
- No add-to-watchlist workflow.
- No scan history or persisted operator universe.
- No pagination/virtualization, because current universe is intentionally small.
- Authenticated visual QA requires a valid Supabase operator session.

## Feature Classification

Overall Global Scan classification: PARTIAL.

Reasons:

- Multi-symbol validated US equities scan now exists.
- Ranking and provenance are visible.
- Unsupported global/breadth/macro capabilities are explicit.
- Full product meaning of "Global" is not implemented; page scope is limited to Alpaca-supported US equities.

## P.7 Result

P.7 Result: PASS.

Global Scan Product Readiness: PARTIAL.

## Recommended P.8 Step

P.8 Data Streams Audit.
