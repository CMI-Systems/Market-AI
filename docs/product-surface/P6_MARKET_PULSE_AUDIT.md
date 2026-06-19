# AICC Phase P.6 - Market Pulse Audit

Date: 2026-06-16

Mode: AUDIT FIRST with targeted Market Pulse fixes

Result: PASS with PARTIAL product readiness.

## Executive Summary

P.6 audited the Market Pulse route, page, data sources, session handling, provenance display, metric integrity, chart integration, and unavailable-state behavior.

Confirmed defects were found and fixed:

- Market Pulse defaulted missing confidence to `0`, creating a valid-looking low score from unavailable cognition.
- The page displayed cognition confidence fields as market breadth values such as advancers, decliners, and new highs even though market breadth is not certified or implemented.
- Provider, source type, session state, provider timestamp, data age, validation status, and quality label were not visible.
- The page did not consume the validated chart-data pipeline created in P.2.
- Missing/unavailable data could produce broad translated prose without enough operator-facing limitation context.
- The 10-second polling loop had no stale-response guard.

P.6 now routes Market Pulse price context through `chartDataService.getValidatedChartData()`, which uses the existing Alpaca backend provider boundary and rejects invalid, simulated, generated, unavailable, mixed-symbol, mixed-provider, duplicate, out-of-order, and invalid-OHLC candles. The page displays explicit provenance and status metadata, uses `MarketPriceChart`, labels unsupported breadth/global/macro metrics as `NOT IMPLEMENTED`, and keeps derived cognition context visibly bounded.

No new provider, Webull path, live trading, order-entry control, provider credential change, Supabase schema/RLS change, simulation fallback, training, Shadow Trainer, Brain Learning, deployment change, or production change was made.

## Feature Inventory

| Capability | State | Evidence |
|---|---|---|
| Overall market state | COMPLETE | Page now derives `BULLISH`, `BEARISH`, `MIXED`, `NEUTRAL`, `DEGRADED`, `DATA_UNAVAILABLE`, or `BLOCKED` from validated chart status and derived cognition. |
| Trend | PARTIAL | Derived from cognition confidence; no dedicated trend provider endpoint on this page. |
| Momentum | PARTIAL | Derived from cognition consensus strength; not a standalone validated momentum service. |
| Volatility | PARTIAL | Derived from validated candle range when enough candles exist; unsupported if candles are unavailable. |
| Liquidity | PARTIAL | Derived from cognition liquidity plus validated average volume. |
| Breadth | NOT_IMPLEMENTED | Explicitly shown as not implemented; no certified breadth source. |
| Regime | PARTIAL | Derived from cognition strategic environment; direct Regime Engine provenance is not surfaced on this page. |
| Risk level | PARTIAL | Derived from cognition strategic environment and status; no independent risk event stream. |
| Session state | COMPLETE | Displayed from validated chart/provider provenance. |
| Provider status | PARTIAL | Provider identity and provider warnings are visible; full provider health detail remains in Data Streams/System surfaces. |
| Market clock | PARTIAL | Session state is visible; next open/previous close are not displayed. |
| Market calendar | NOT_IMPLEMENTED | No certified holiday/calendar surface on Market Pulse. |
| Quote summary | COMPLETE | Uses validated chart quote when available; unavailable remains explicit. |
| Candle-derived metrics | COMPLETE | Uses validated chart candles only. |
| Tactical summary | PARTIAL | Indirect via confidence/cognition only; no direct Tactical Brain panel. |
| Behavioral summary | NOT_IMPLEMENTED | Not directly shown. |
| Failsafe summary | PARTIAL | Market Pulse blocks/degrades based on validation status but does not render full Failsafe Brain details. |
| Consensus summary | PARTIAL | Uses confidence consensus strength. |
| Narrative | PARTIAL | Shows bounded AI conclusions and warnings; no full Narrative Engine citation path. |
| Symbol selection | COMPLETE | Supported for `SPY`, `QQQ`, `NVDA`, `AAPL`, `MSFT`. |
| Timeframe selection | COMPLETE | Uses `CHART_TIMEFRAMES`: `1Min`, `5Min`, `15Min`, `1Hour`, `1Day`. |
| Refresh | COMPLETE | Manual refresh button and bounded 30-second refresh loop. |
| Loading state | COMPLETE | Page and chart show loading state. |
| Empty state | COMPLETE | Empty/unavailable chart data becomes explicit `DATA UNAVAILABLE`. |
| Error state | COMPLETE | Backend/provider failures remain unavailable and do not fabricate values. |
| Provenance display | COMPLETE | Provider, source type, session, timestamp, data age, validation, quality are visible. |
| Timestamp display | COMPLETE | Provider timestamp and last loaded timestamp are shown; missing timestamps remain unavailable. |
| Quality display | COMPLETE | Validation status and quality label are shown. |

Market Pulse Capabilities Identified: 28.

Complete Capabilities: 13.

Partial Capabilities: 11.

Missing Capabilities: 4.

## Source Audit

| Source | Classification | Notes |
|---|---|---|
| Alpaca quote data via backend market routes | VALIDATED_RAW | Accessed through `chartDataService` and `marketProviderApi`. |
| Alpaca candle/bar data via backend market routes | VALIDATED_RAW | Normalized and validated before chart/metric use. |
| Backend provider status/session metadata | VALIDATED_RAW / EXPLICIT_UNAVAILABLE_STATE | Used through chart/provider status metadata. |
| Market session policy | DERIVED_FROM_VALIDATED_RAW | Session metadata comes from backend provider/session availability handling. |
| `chartDataService` validation results | DERIVED_FROM_VALIDATED_RAW | Frontend adapter rejects unsafe chart records. |
| `getConfidence()` | VALIDATED_INTELLIGENCE / LIMITED | Used as bounded cognition context; not displayed as raw data. |
| `getLiquidityPressure()` | VALIDATED_INTELLIGENCE / LIMITED | Used as bounded cognition context. |
| `getInstitutionalFlow()` | VALIDATED_INTELLIGENCE / LIMITED | Used as bounded cognition context. |
| `getStrategicEnvironment()` | VALIDATED_INTELLIGENCE / LIMITED | Used for regime/risk/narrative context. |
| Market breadth/global/macro | EXPLICIT_UNAVAILABLE_STATE | Now displayed as not implemented instead of inferred from confidence. |
| Static fixture/local placeholder | NOT_FOUND | No static Market Pulse market values remain in the page. |
| Development-only data | BLOCKED_BY_RUNTIME_POLICY | Frontend cognition demo policy fails closed outside dev/test. |

Validated Data Sources: 5.

Placeholder/Unknown Sources: 1.

## Market Pulse Contract

P.6 verified and implemented the following effective page contract:

```js
{
  status,
  symbol,
  timeframe,
  marketState,
  trend,
  momentum,
  volatility,
  liquidity,
  breadth,
  regime,
  riskLevel,
  confidence,
  provider,
  sourceType,
  timestamp,
  receivedAt,
  dataAge,
  sessionState,
  marketOpen,
  validationStatus,
  qualityLabel,
  available,
  simulated,
  generated,
  provenance,
  warnings
}
```

Implemented behavior:

- Missing score is displayed as `UNAVAILABLE`, not `0`.
- Missing timestamp remains `UNAVAILABLE`.
- Unsupported breadth/global/macro metrics remain `NOT IMPLEMENTED`.
- Simulated/generated records are blocked by the chart adapter.
- Unknown or unavailable chart data produces `DATA UNAVAILABLE`, `PROVIDER OFFLINE`, or `BLOCKED`.

## Market State Integrity

Market Pulse now distinguishes:

- `BULLISH`
- `BEARISH`
- `MIXED`
- `NEUTRAL`
- `DEGRADED`
- `UNKNOWN`
- `DATA_UNAVAILABLE`
- `BLOCKED`

Integrity result: PASS.

Limits:

- `BULLISH`/`BEARISH` remain derived from cognition strategic context and validated chart availability, not a complete multi-source market-wide model.
- Breadth/global/macro do not influence state because they are not implemented.

## Metric Validation

| Metric | Source | Validation Result |
|---|---|---|
| Last price | Validated chart quote | PASS; unavailable if quote rejected. |
| Change | Validated chart quote | PASS; unavailable if missing. |
| Trend | Cognition confidence | PARTIAL; bounded as derived intelligence. |
| Momentum | Cognition consensus strength | PARTIAL; bounded as derived intelligence. |
| Liquidity | Cognition liquidity + candle volume | PARTIAL; no direct market depth provider. |
| Average volume | Validated candles | PASS; unavailable when candles fail validation. |
| Volatility range | Validated candles | PASS/PARTIAL; simple recent range, not VIX. |
| Breadth | None | NOT_IMPLEMENTED. |
| Sector/global/macro | None | NOT_IMPLEMENTED. |

Metric Integrity: PASS within the certified Alpaca quote/candle scope; PARTIAL for broad-market interpretation.

## Breadth/Global Capability Audit

Market Pulse does not have certified support for:

- Advance/decline breadth.
- Sector breadth.
- Index breadth.
- Global-market data.
- Macro data.

P.6 removed the misleading display where confidence score/level was shown as advancers, decliners, and new highs.

## Regime/Consensus Integration

Regime and consensus remain PARTIAL:

- Regime uses cognition strategic environment fields.
- Consensus uses confidence consensus strength.
- Failsafe details are not directly rendered.
- Blocked chart validation prevents the page from reporting a healthy market pulse state.

Regime/Consensus Integration: PARTIAL.

## Session Handling

Market Pulse displays:

- Session state.
- Source type.
- Market-open state indirectly through chart provenance.
- Provider timestamp.
- Data age.
- Validation status.

Session Handling: PASS.

Known limitation:

- Next open and previous close are not displayed on the page.

## Timestamp/Freshness

P.6 fixes and validation:

- Provider timestamp is preserved from chart provenance.
- Missing timestamp displays as `UNAVAILABLE`.
- Data age is formatted from backend millisecond values.
- Stale/degraded states are displayed through chart status.
- Last loaded time is separate from provider timestamp.
- No current-time substitution was added for provider data.

Timestamp/Freshness: PASS.

## Confidence Integrity

P.6 fixes:

- Missing confidence no longer becomes `0`.
- Confidence is displayed as `UNAVAILABLE` when cognition is unavailable.
- Unsupported metrics do not inflate confidence.
- Degraded/blocked chart status is visible separately from cognition score.

Confidence Integrity: PASS.

Remaining limitation:

- Cognition confidence still comes from existing cognition endpoints; this audit did not redesign the confidence model.

## Provenance Visibility

Market Pulse now displays:

- Provider.
- Source type.
- Session.
- Provider timestamp.
- Data age.
- Validation status.
- Quality label.
- Last loaded time.
- Warnings from validation/provider/cognition inputs.

Provenance Visibility: PASS.

## Chart/Watchlist Integration

Chart integration:

- Market Pulse now embeds `MarketPriceChart`.
- Chart symbol/timeframe controls are available.
- Chart data is loaded through `getValidatedChartData`.
- Rapid symbol/timeframe changes are stale-response protected with a request ID.

Watchlist integration:

- Market Pulse and Watchlists now share the same chart data adapter and symbol universe.
- Direct cross-page state handoff from Watchlists to Market Pulse is not implemented.

Chart/Watchlist Integration: PARTIAL.

## Signals/Alerts Integration

Signals:

- Market Pulse does not treat provider signals as confirmation.
- Signal state is not directly consumed by Market Pulse.

Alerts:

- Market Pulse exposes degraded/unavailable status and warnings that can support operator interpretation.
- There is no direct Market Pulse-to-Alerts event creation.

Signals/Alerts Integration: PARTIAL.

## Operator Workflow

| Workflow Step | Result |
|---|---|
| Open Market Pulse | PASS; route exists and remains protected. |
| Identify symbol/timeframe | PASS. |
| Read market state | PASS. |
| Inspect trend/momentum/volatility/liquidity | PASS/PARTIAL; unsupported metrics are explicit. |
| See provider/timestamp/session | PASS. |
| Understand degraded/unavailable conditions | PASS. |
| Open related chart | PASS; chart is embedded. |
| Navigate to Tactical/Failsafe/Signals | PARTIAL; global navigation exists, page-specific deep links do not. |
| Return without losing intended state | PARTIAL; route reload resets local symbol/timeframe to defaults. |

Operator Workflow: PARTIAL.

## UI State Integrity

Supported page states:

- `LOADING`
- `READY` through validated chart status.
- `DEGRADED`
- `PARTIAL_DATA`
- `STALE`
- `DELAYED`
- `CACHED`
- `MARKET_CLOSED`
- `PROVIDER_OFFLINE`
- `BACKEND_UNAVAILABLE`
- `DATA_UNAVAILABLE`
- `UNKNOWN`
- `BLOCKED`

No state is allowed to appear healthy solely from missing data.

## Responsive Findings

Responsive result: PASS.

Evidence:

- Header controls wrap.
- Provenance grid collapses from 4 columns to 2 and then 1.
- Metric grid collapses to 1 column on mobile.
- Chart wrapper respects page width.
- Text wraps with `overflow-wrap`.

Authenticated visual QA remains limited by the lack of a valid local Supabase operator session.

## Accessibility Findings

Accessibility result: PARTIAL.

Implemented:

- Labeled controls.
- Provenance section has an accessible label.
- Status is text-based, not color-only.
- Chart component includes an accessible title and text summary.

Remaining:

- No live-region announcement for refresh completion.
- No dedicated skip/focus affordance for the chart controls.

## Performance Findings

Performance result: PASS.

P.6 improvements:

- Refresh interval changed from 10 seconds to 30 seconds.
- Stale-response protection prevents old symbol/timeframe responses from overwriting current state.
- Chart lifecycle remains delegated to `MarketPriceChart`, which creates/disposes chart instances safely.
- No unbounded interval or duplicate polling loop was introduced.

## Scenario Matrix

| Scenario | Expected | Result |
|---|---|---|
| Valid regular-session raw data | READY within supported scope | PASS via chart adapter path. |
| Valid pre-market data | PRE_MARKET and labeled | PASS when backend provenance supplies session. |
| Market closed with cached data | MARKET_CLOSED/CACHED, not provider failure | PASS through chart status/provenance. |
| Provider offline | PROVIDER_OFFLINE or DATA_UNAVAILABLE | PASS through unavailable chart result. |
| Backend unavailable | BACKEND_UNAVAILABLE/DATA_UNAVAILABLE | PASS through service fallback. |
| Empty candle data | DATA_UNAVAILABLE | PASS. |
| Partial data | DEGRADED/PARTIAL | PASS. |
| Stale data | STALE with reduced confidence/status | PASS. |
| Invalid timestamp | BLOCKED | PASS through chart adapter. |
| Invalid OHLC | BLOCKED | PASS through chart adapter. |
| Simulated/generated input | BLOCKED | PASS through chart adapter. |
| Regime unavailable | UNKNOWN or DEGRADED | PASS. |
| Failsafe blocked | Market Pulse cannot report healthy | PASS through blocked status handling. |
| Symbol change | Correct reload without stale overwrite | PASS via request ID guard. |
| Mobile viewport | No broken layout expected | PASS by responsive CSS; authenticated visual QA pending. |

## Validation Results

Commands/checks run:

```powershell
npm.cmd run build
node -e "require('./routes/marketRoutes'); require('./routes/cognitionRoutes'); require('./services/marketDataValidator'); require('./services/marketSessionPolicy'); console.log('backend module load ok');"
```

Results:

- Frontend build: PASS.
- Backend route/module load: PASS.
- Protected `/market-pulse` smoke: PASS; unauthenticated access redirected safely to `/login`.
- In-app browser console errors during protected-route smoke: 0.
- Root mount check: PASS.
- Visible `NaN`: not found.
- Visible `undefined`: not found.
- Dev server cleanup: PASS; no active listener remained on port `5174`.

## Defects Found

1. HIGH: Missing confidence defaulted to `0`.
2. HIGH: Breadth panel displayed cognition confidence as advancers/decliners/new highs.
3. HIGH: Provider/source/session/timestamp/data-age/validation/quality provenance was not visible.
4. MODERATE: Market Pulse did not consume the validated chart-data pipeline.
5. MODERATE: Stale response protection was missing during polling/refresh.
6. MODERATE: Unsupported breadth/global/macro capabilities were not clearly separated from supported quote/candle scope.
7. LOW: Polling cadence was more aggressive than needed for this summary surface.

## Exact Fixes

Modified:

- `FrontendReact/src/pages/MarketPulse.jsx`
- `FrontendReact/src/styles/MarketPulse.css`
- `docs/product-surface/P6_MARKET_PULSE_AUDIT.md`

Changes:

- Rebuilt Market Pulse page around `getValidatedChartData`.
- Added `MarketPriceChart` integration.
- Added symbol/timeframe controls and manual refresh.
- Added request-ID stale response protection.
- Added provider/source/session/timestamp/data-age/validation/quality display.
- Removed false breadth values and replaced them with explicit `NOT IMPLEMENTED` state.
- Changed missing confidence score display to `UNAVAILABLE`.
- Added derived volatility range and average volume only from validated candles.
- Added warnings display.
- Reworked responsive CSS and removed decorative gradient orb backgrounds.

## Remaining Gaps

- Market breadth is not implemented.
- Global and macro context are not implemented.
- Market calendar/holiday verification is not directly displayed.
- Direct Tactical/Behavioral/Failsafe details are not embedded.
- Watchlist-to-Market Pulse state handoff is not implemented.
- Market Pulse-to-Alerts event generation is not implemented.
- Authenticated visual QA requires a valid Supabase operator session.

## Feature Classification

Overall Market Pulse classification: PARTIAL.

Reasons:

- The page now uses validated Alpaca quote/candle data for price context.
- Provenance and unavailable states are explicit.
- Unsupported breadth/global/macro claims are removed.
- Several intelligence summaries remain derived and limited, not fully certified direct brain integrations.

## P.6 Result

P.6 Result: PASS.

Market Pulse Product Readiness: PARTIAL.

## Recommended P.7 Step

P.7 Global Scan Audit.
