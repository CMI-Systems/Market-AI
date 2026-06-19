# AICC Phase P.4 - Signals Audit

Date: 2026-06-16

Mode: AUDIT FIRST with targeted Signals fixes

Result: PASS with PARTIAL product readiness.

## Executive Summary

P.4 audited the Signals surface after P.2 chart modernization and P.3 Watchlists hardening.

Signals is a protected route that uses the backend Alpaca provider signal endpoint, validated chart data from `chartDataService`, and the shared `MarketPriceChart` component. The page is safe for operator review of a single selected symbol/timeframe, but it is not a full signal-management system. Signal persistence, acknowledgment, dismissal, expiration, historical signal review, filtering, sorting, and multi-signal list workflow are not implemented.

Confirmed defects were found and fixed:

- Missing or invalid provider signals could appear as `NEUTRAL` with `0%` confidence.
- Provider signal objects were trusted without frontend validation of provider, source type, symbol, timestamp, confidence, availability, simulation, or generation flags.
- Signal markers could be created from a price/timestamp without confirming provider provenance.
- Signal provenance, source type, timestamp, age, validation, and quality were not visible enough for operator interpretation.
- Blocked or unavailable signal states did not explain the blocking reason.

No Webull connection, live trading, order-entry control, provider credential change, Supabase schema/RLS change, training activation, Shadow Trainer activation, Brain Learning activation, or production deployment change was made. The Command Center `displayState` import from `../services/providerDisplay` remains intact.

## Signal Feature Inventory

| Capability | State | Evidence |
|---|---|---|
| Signal list | NOT_IMPLEMENTED | Page reviews one selected symbol signal, not a list/table. |
| Signal cards/table | PARTIAL | Summary cards and explanation panels exist, but no multi-signal table. |
| Symbol | COMPLETE | Symbol selector comes from `getChartSymbols()`. |
| Direction | PARTIAL | Derived display now maps signal labels to `LONG_BIAS`, `RISK_MONITOR`, or `BALANCED`; no trade-side execution model exists. |
| Confidence | COMPLETE | Confidence is displayed only for validated provider signals and not defaulted. |
| Entry | NOT_IMPLEMENTED | No entry field is supplied by provider signals. |
| Stop | NOT_IMPLEMENTED | No stop field is supplied by provider signals. |
| Target | NOT_IMPLEMENTED | No target field is supplied by provider signals. |
| Timestamp | COMPLETE | Signal timestamp is retained from provider signal `timestamp`/`updatedAt` and validated before use. |
| Status | COMPLETE | `READY`, `PARTIAL_DATA`, `STALE`, `INVALID_SIGNAL`, and unavailable states are explicit. |
| Provider | COMPLETE | Signals are accepted only from Alpaca in the current certified boundary. |
| Source type | COMPLETE | Source type is displayed and blocked when unsafe. |
| Timeframe | COMPLETE | Chart timeframe selector uses supported P.2 timeframes. |
| Regime | NOT_IMPLEMENTED | Signals page does not display regime context. |
| Tactical context | PARTIAL | Backend provider signals are tactical price-action derived; page does not show full Tactical Brain output. |
| Behavioral context | NOT_IMPLEMENTED | Behavioral Brain context is not displayed. |
| Failsafe status | PARTIAL | Unsafe signal provenance is blocked locally; full Failsafe Brain state is not shown. |
| Chart integration | COMPLETE | Selected symbol/timeframe drives `MarketPriceChart`. |
| Filtering | NOT_IMPLEMENTED | No multi-signal list exists to filter. |
| Sorting | NOT_IMPLEMENTED | No multi-signal list exists to sort. |
| Search | NOT_IMPLEMENTED | Symbol selection is through the chart symbol selector. |
| Persistence | NOT_IMPLEMENTED | Signals are derived on demand. |
| Acknowledgment | NOT_IMPLEMENTED | No operator acknowledgment state. |
| Dismissal | NOT_IMPLEMENTED | No dismissal state. |
| Expiration | PARTIAL | Stale/source states are visible; lifecycle expiration rules are not implemented. |
| Historical signals | NOT_IMPLEMENTED | No persisted historical signal store. |

## Signal Source Audit

| Source | Classification | Notes |
|---|---|---|
| `/api/market/provider-signals` | RAW_DERIVED_VALIDATED | Backend derives provider signals from quote/candle paths; frontend now validates returned signal metadata before display. |
| `chartDataService.getValidatedChartData` | RAW_DERIVED_VALIDATED | Supplies validated chart candles, quote, validation, and provenance. |
| Tactical Brain output | INTELLIGENCE_DERIVED_VALIDATED / PARTIAL | Provider signal generation is price-action tactical, but Signals page does not consume full Tactical Brain output. |
| Consensus output | NOT_IMPLEMENTED | Not consumed by Signals page. |
| Regime output | NOT_IMPLEMENTED | Not consumed by Signals page. |
| Static fixtures | STATIC_PLACEHOLDER / BLOCKED | P.2 removed static marker fixtures from the chart path; `marketDataService` fixtures remain isolated behind demo policy and are not used for Signals market values. |
| Persisted signal records | NOT_IMPLEMENTED | No Supabase or local signal history store. |
| Unknown source | UNAVAILABLE_STATE | Unknown provider/source is blocked as invalid. |

Validated Signal Sources: 2.

Placeholder/Unknown Sources: 1.

## Signal Contract

Canonical signal contract used for P.4:

```js
{
  id,
  symbol,
  direction,
  confidence,
  timestamp,
  timeframe,
  entry,
  stop,
  target,
  status,
  provider,
  sourceType,
  sessionState,
  validationStatus,
  qualityLabel,
  tacticalState,
  behavioralState,
  failsafeState,
  provenance,
  warnings
}
```

Current implemented subset:

- `symbol`
- `direction` derived for display
- `confidence`
- `timestamp`
- `timeframe` through chart context
- `status`
- `provider`
- `sourceType`
- `sessionState`
- `validationStatus`
- `qualityLabel`
- `provenance`
- `warnings`

Not implemented: `id`, `entry`, `stop`, `target`, full tactical/behavioral/failsafe state, persistence lifecycle fields.

## Integrity Rules

P.4 added frontend signal validation in `Signals.jsx`:

- Symbol must match selected symbol.
- Provider must be Alpaca.
- Signal must be available.
- `simulated` and `generated` must be false.
- `sourceType` must not be simulated, generated, unknown, invalid-timestamp, provider-offline, backend-unavailable, provider-unavailable, data-unavailable, or blocked.
- Signal label must be recognized.
- Timestamp must be valid.
- Confidence must be finite and between 0 and 100.
- Optional signal price must be finite and positive when present.

Signal Integrity: PASS.

## Direction/Risk Validation

Implemented:

- `BUY WATCH`, `MOMENTUM WATCH`, and `REVERSAL WATCH` display as `LONG_BIAS`.
- `RISK WATCH` displays as `RISK_MONITOR`.
- `NEUTRAL` displays as `BALANCED`.
- Invalid or unavailable signals display `UNAVAILABLE`.

Not implemented:

- Entry/stop/target relationship validation because backend provider signals do not currently provide those fields.

Direction/Risk Validation: PASS for implemented signal fields; entry/stop/target workflow remains NOT_IMPLEMENTED.

## Confidence Integrity

Fixed:

- Missing confidence no longer becomes `0%`.
- Invalid confidence blocks the signal display.
- Confidence is shown only for validated provider signals.
- Unavailable signals show `--`.

Remaining limitation:

- Backend provider signal confidence is heuristic, not probability. The UI labels it as confidence only and does not present it as execution probability.

Confidence Integrity: PASS.

## Timestamp/Freshness

Fixed:

- Signal markers require a valid signal timestamp.
- Signal timestamp is displayed separately from chart candle timestamp.
- Signal age is displayed when provider metadata supplies `dataAge`.
- Invalid timestamp blocks signal trust.
- Stale source type is displayed as `STALE`.

Remaining limitation:

- Formal expiration windows are not implemented for signal lifecycle state.

Timestamp/Freshness: PASS.

## Signal Lifecycle

Supported lifecycle states:

- `READY`
- `PARTIAL_DATA`
- `STALE`
- `INVALID_SIGNAL`
- `DATA_UNAVAILABLE`
- `BACKEND_UNAVAILABLE`
- `PROVIDER_OFFLINE`

Not implemented:

- `NEW`
- `ACTIVE` as a persisted lifecycle
- `EXPIRED`
- `DISMISSED`
- `ARCHIVED`

Signal Lifecycle: PARTIAL.

## Chart Synchronization

Signals uses:

- `MarketPriceChart`
- `getValidatedChartData(selectedSymbol, selectedTimeframe)`
- validated provider signal markers only when timestamp, price, provider, source type, availability, and confidence pass local validation.

Verified by code audit:

- Selecting a symbol in the chart controls updates `selectedSymbol`.
- Chart state clears before each selected-symbol/timeframe load.
- Stale async responses are ignored through effect cleanup.
- Provider markers are not rendered unless signal validation passes.
- Failed chart loads show explicit unavailable chart state through `MarketPriceChart`.

Authenticated visual QA remains pending because protected routes require a valid Supabase operator session.

Chart Synchronization: PASS.

## Brain Integration

Current state:

- Backend provider signals are derived from validated quote/candle paths and are tactical price-action signals.
- Full Tactical Brain output is not consumed directly by the Signals page.
- Behavioral Brain output is not consumed directly.
- Failsafe Brain output is not displayed directly, but unsafe provider/provenance states are blocked locally.
- Consensus, Regime, and Narrative outputs are not consumed directly.

Brain Integration: PARTIAL.

## Provider/Data-State Handling

Handled:

- Provider offline: blocked/unavailable.
- Backend offline: chart and signal state unavailable.
- Partial data: labeled `PARTIAL_DATA`.
- Stale data: labeled `STALE`.
- Cached/delayed data: chart provenance displays source type.
- Market closed: chart/session metadata displays market state where supplied.
- Unknown provider: blocked.
- Unsupported provider: blocked.
- Simulated/generated input: blocked.

No fake price, timestamp, confidence, or marker is generated by the Signals page.

## Persistence Audit

Persistence: DERIVED_ONLY.

Signals are not:

- Supabase persisted.
- localStorage persisted.
- Session persisted.
- Acknowledged.
- Dismissed.
- Archived.

No signal record is written as raw-certified market data.

## Operator Workflow

| Step | Result |
|---|---|
| Open Signals | Protected route exists; unauthenticated redirect verified in P.2 and retested during P.4. |
| View signal list | FAIL as a multi-signal list; page is a single-symbol inspection surface. |
| Select signal | PARTIAL; operator selects symbol/timeframe, not a signal row. |
| Read direction and confidence | PASS for validated provider signal. |
| Inspect provenance | PASS after P.4 fix. |
| Open synchronized chart | PASS by code/build audit. |
| Review entry/stop/target | NOT_IMPLEMENTED. |
| Understand blocked/degraded state | PASS after P.4 fix. |
| Navigate to related intelligence page | PARTIAL; sidebar/nav exists at app level but no contextual handoff. |
| Return without losing intended state | PARTIAL; state is local component state. |

Operator Workflow: PARTIAL.

## Filtering/Sorting

Not implemented because no multi-signal list exists.

Recommended future controls:

- Symbol.
- Direction.
- Confidence.
- Status.
- Timeframe.
- Freshness.
- Provider.
- Regime.

## Responsive Findings

Signals layout uses:

- Four-column summary grid with tablet/mobile collapse.
- Single-column chart workspace below 1000px.
- `MarketPriceChart` responsive resize controls from P.2.

Protected-route smoke verified the route redirects safely when unauthenticated. Full authenticated responsive validation requires an approved Supabase operator session.

Responsive Safety: PASS for protected-route safety and code-level responsive layout.

## Accessibility Findings

Implemented:

- Chart controls are keyboard-accessible native selects/buttons.
- Signal status, source, timestamp, and warnings are text labels, not color-only.
- Chart has accessible title and textual summary via `MarketPriceChart`.
- Blocked/degraded reasons are visible.

Remaining limitations:

- No multi-signal row/card selection semantics exist.
- No textual equivalents for entry/stop/target markers because those markers are not implemented.

Accessibility: PARTIAL.

## Performance Findings

Implemented:

- One Signals polling interval.
- Interval is cleared on route unmount.
- Chart request is scoped to selected symbol/timeframe.
- Stale async results are ignored after cleanup.
- Chart instance lifecycle remains owned by `MarketPriceChart`.
- No unbounded signal list exists.

Remaining limitation:

- Provider status, chart data, and provider signal are fetched separately. This is acceptable at current scale but can be batched later.

Performance Safety: PASS.

## Scenario Matrix

| Scenario | Result |
|---|---|
| Fully valid signal | PASS; displays `READY`, confidence, provenance, and chart context. |
| Missing timestamp | PASS; `INVALID_SIGNAL`. |
| Invalid confidence | PASS; `INVALID_SIGNAL`. |
| LONG signal with stop above entry | NOT_IMPLEMENTED; entry/stop/target fields are not available. |
| SHORT signal with target above entry | NOT_IMPLEMENTED; short-side signal contract is not available. |
| Missing entry/stop/target | PASS as not fabricated; fields are absent rather than invented. |
| Provider offline | PASS; blocked/unavailable. |
| Backend offline | PASS; chart state `BACKEND_UNAVAILABLE`; signal invalid/unavailable. |
| Stale signal | PASS; `STALE`. |
| Expired signal | PARTIAL; no explicit expiration lifecycle yet. |
| Simulated/generated signal | PASS; blocked. |
| Unknown provider | PASS; blocked. |
| Signal selection | PARTIAL; symbol/timeframe selection updates chart, but signal row selection is not implemented. |
| Rapid signal switching | PASS by effect cleanup. |
| Mobile viewport | PASS for protected-route smoke and code-level responsive layout. |

## Defects Found

1. HIGH: Missing provider signals could render as valid-looking `NEUTRAL`.
2. HIGH: Provider signal objects were not validated before display.
3. HIGH: Signal markers could render from untrusted price/timestamp fields.
4. MODERATE: Signal confidence could appear as `0%` instead of unavailable.
5. MODERATE: Signal provenance, source type, timestamp, data age, validation, and quality were not visible.
6. MODERATE: Blocked/degraded reasons were not displayed to the operator.

## Exact Fixes

Modified:

- `FrontendReact/src/pages/Signals.jsx`
- `FrontendReact/src/styles/Signals.css`

Fixes:

- Added provider/source/symbol/timestamp/confidence/availability/simulation/generated validation for provider signal objects.
- Blocked unsupported providers and unsafe source types.
- Removed `NEUTRAL` and `0%` as missing-signal fallbacks.
- Required validated signal payloads before rendering signal markers.
- Added signal status, timestamp, source, age, direction, validation, and warning display.
- Added warning text styling for blocked/degraded signal reasons.

## Remaining Gaps

- No multi-signal list or table.
- No signal persistence/history.
- No acknowledgment, dismissal, archive, or expiration workflow.
- No entry/stop/target contract from provider signals.
- No full Tactical/Behavioral/Failsafe/Consensus/Regime/Narrative context panel.
- Authenticated Signals visual QA requires a valid Supabase operator session.

## Feature Classification

Overall Signals classification: PARTIAL.

Rationale:

- The single-symbol Signals review surface is now safer and connected to validated Alpaca-backed chart data.
- Unsafe provider signals no longer appear valid.
- The feature is not yet a complete signal-management workflow.

## Build and Smoke Results

Build command:

```powershell
npm.cmd run build
```

Build result: PASS.

Smoke:

- `/signals` protected-route smoke completed with safe unauthenticated redirect to `/login`.
- No blank screen, visible `NaN`, visible `undefined`, or console errors were observed.
- Full authenticated visual QA remains pending because no valid Supabase operator session was used.

Smoke Test: PASS.

## P.4 Result

PASS.

Signals Product Readiness: PARTIAL.

## Recommended P.5 Step

P.5 Alerts Audit.
