# AICC Phase P.3 - Watchlists Audit

Date: 2026-06-15

Mode: AUDIT FIRST with targeted Watchlists fixes

Result: PASS with PARTIAL product readiness.

## Executive Summary

P.3 audited the current Watchlists surface after P.2 chart modernization.

Watchlists is protected, locally persisted through `localStorage`, connected to backend market quote/signal routes, and synchronized with the shared `MarketPriceChart` component. The feature is operator-usable for a single local symbol list, but it is not a full multi-list watchlist manager and is not Supabase-persisted.

Confirmed defects were found and fixed:

- Provider/backend unavailable responses could leave prior valid-looking price/change values in rows.
- Invalid symbol input was silently normalized instead of explicitly rejected.
- Empty watchlists had no explicit empty state.
- Selected row provenance fields were not visible.
- Unavailable change values could receive positive/negative color state.
- Remove controls were not native buttons.

No Webull connection, trading, provider credential change, Supabase schema/RLS change, training activation, Shadow Trainer activation, Brain Learning activation, or production deployment change was made.

## Feature Inventory

| Capability | State | Evidence |
|---|---|---|
| Default watchlist | PARTIAL | Default symbols load locally; market values remain unavailable until backend provider returns validated data. |
| Custom watchlists | PARTIAL | Operators can edit one local symbol list; named multi-list management is not implemented. |
| Add symbol | COMPLETE | Valid uppercase symbols are added and persisted to `localStorage`. |
| Remove symbol | COMPLETE | Symbols can be removed with a native button. |
| Rename list | NOT_IMPLEMENTED | No named watchlist object exists. |
| Delete list | NOT_IMPLEMENTED | No named watchlist object exists. |
| Reorder symbols | NOT_IMPLEMENTED | Sorting exists; manual ordering does not. |
| Select active symbol | COMPLETE | Row click and keyboard activation update selected symbol. |
| Search symbol | COMPLETE | Search filters visible rows. |
| Quote display | PARTIAL | Connected to backend quotes; unavailable and unsafe records are blocked to explicit unavailable state. |
| Change display | PARTIAL | Connected to backend quotes; unavailable values render `--`. |
| Percent change | PARTIAL | Connected to backend quotes; unavailable values render `--`. |
| Status display | COMPLETE | Provider, fallback, provider health, and market status are visible. |
| Provider/source display | COMPLETE | Selected row now includes provider, source type, session, data age, and validation. |
| Chart synchronization | COMPLETE | Selected symbol updates `MarketPriceChart`, and chart state is cleared during reload. |
| Persistence | PARTIAL | `localStorage` symbol list only; no Supabase operator-owned watchlist table. |
| Empty state | COMPLETE | Empty list and no-match states are explicit. |
| Error state | COMPLETE | Duplicate, invalid-symbol, provider-unavailable, and backend-unavailable states are explicit. |

## Data Source Audit

| Displayed Field | Source | Classification |
|---|---|---|
| Symbol | Operator local state / default local list | LOCAL_STATE |
| Name | Local static symbol metadata | STATIC_PLACEHOLDER |
| Last price | Backend quote through `marketProviderApi.getMarketQuotes` | RAW_PROVIDER_DATA |
| Change % | Backend quote through `marketProviderApi.getMarketQuotes` | RAW_PROVIDER_DATA |
| Volume | Backend quote through `marketProviderApi.getMarketQuotes` | RAW_PROVIDER_DATA |
| Signal | Backend provider signals when available; otherwise unavailable | DERIVED_FROM_VALIDATED_RAW / EXPLICIT_UNAVAILABLE_STATE |
| Confidence | Backend provider signals when available; otherwise unavailable | DERIVED_FROM_VALIDATED_RAW / EXPLICIT_UNAVAILABLE_STATE |
| Risk | Backend provider signals when available; otherwise unavailable | DERIVED_FROM_VALIDATED_RAW / EXPLICIT_UNAVAILABLE_STATE |
| Provider | Backend quote/provider status | RAW_PROVIDER_DATA |
| Provider status | Backend provider status | RAW_PROVIDER_DATA |
| Market status | Backend provider status | RAW_PROVIDER_DATA |
| Source type | Backend quote metadata | RAW_PROVIDER_DATA |
| Session state | Backend quote/provider metadata | RAW_PROVIDER_DATA |
| Data age | Backend quote metadata | RAW_PROVIDER_DATA |
| Validation state | Backend quote market-data validation metadata | RAW_PROVIDER_DATA |
| Chart candles | `chartDataService.getValidatedChartData` | RAW_PROVIDER_DATA |

No displayed market field is allowed to retain prior valid-looking data when the current provider response is unavailable or unsafe.

## Quote Integrity

Audited behavior:

- Valid quote: row uses quote price/change/volume/provider metadata.
- Missing quote: row becomes `DATA_UNAVAILABLE`.
- Missing last price: row price renders `--`.
- Invalid timestamp: row timestamp renders `--`.
- Stale/source-blocked quote: row becomes explicit unavailable/degraded according to source metadata.
- Provider offline/backend offline: rows clear market values.
- Market closed: displayed through provider market/session state.
- Simulated/generated input: blocked through `BLOCKED_SOURCE_TYPES` and `simulated/generated` checks.
- Unknown provider: blocked unless provider is Alpaca.
- Symbol mismatch: quote map is keyed by normalized symbol, so mismatches do not attach to the wrong row.

Quote Integrity: PASS.

## Symbol Management

Validated:

- Valid symbols can be added.
- Duplicates are rejected with explicit feedback.
- Empty symbols are rejected.
- Invalid characters are rejected with `INVALID_SYMBOL`.
- Case is normalized to uppercase.
- Symbol removal works.
- Removing the selected symbol falls back to the next symbol or empty selected state.
- Empty watchlist shows `EMPTY_WATCHLIST`.
- No prior symbol chart data remains under a new symbol label because chart state is cleared before each selected-symbol load.

Symbol Management: PASS.

## Chart Synchronization

Watchlists uses:

- `MarketPriceChart`
- `getValidatedChartData(selectedSymbol, selectedTimeframe)`

Verified by code audit:

- Selecting a watchlist row updates `selectedSymbol`.
- The selected chart clears candles, quote, validation, and provenance before loading the new symbol.
- Unmounted/stale effect responses are ignored.
- Timeframe remains consistent until the operator changes it.
- Chart provider/provenance is displayed inside `MarketPriceChart`.
- Failed symbol loads show explicit unavailable state.

Authenticated chart visual QA was not possible locally because protected routes require a valid Supabase operator session. Protected-route smoke still verified safe redirect behavior.

Chart Synchronization: PASS.

## Persistence Audit

Persistence type: LOCAL_ONLY.

Implemented:

- Symbol list is persisted under `market-ai-watchlist-symbols` in `localStorage`.

Not implemented:

- Supabase watchlist table.
- Operator-owned server persistence.
- Named watchlists.
- Cross-device sync.

Security notes:

- No market data is persisted as raw-certified data.
- No Supabase schema or RLS changes were made.
- No cross-user backend write path exists for Watchlists.
- Local persistence stores only symbols, not provider credentials, raw quote payloads, or certification metadata.

## Operator Workflow

Workflow audit:

| Step | Result |
|---|---|
| Open Watchlists | Protected route exists; unauthenticated redirect verified. |
| View default list | PARTIAL; default symbols exist, quote values require provider response. |
| Add symbol | PASS. |
| Select symbol | PASS by code audit. |
| View quote state | PASS for available/unavailable states by code audit. |
| View chart | PASS by build/code audit; authenticated visual QA not available locally. |
| Change timeframe | PASS through chart controls. |
| Remove symbol | PASS. |
| Reload page | PASS for local symbol persistence. |
| Return to prior state | PARTIAL; symbols restore locally, selected symbol does not persist separately. |

Operator Workflow: PARTIAL.

## Navigation Integration

Verified:

- `/watchlists` route exists in `FrontendReact/src/App.jsx`.
- Route is protected through `ProtectedRoute`.
- Command Center links to `/watchlists`.
- Unauthenticated access redirects safely to `/login`.

Not implemented:

- Dedicated cross-links from Watchlists to Signals, Replay Center, or Command Center chart focus.
- Mobile navigation component was not found as a separate implementation in the inspected files.

## UI State Integrity

Supported states:

- LOADING through `MarketPriceChart`.
- READY when rows/chart have usable data.
- PARTIAL_DATA through chart status/provenance.
- STALE through chart status/provenance.
- MARKET_CLOSED through provider market/session status.
- PROVIDER_OFFLINE through row/source status.
- BACKEND_UNAVAILABLE through offline provider status and row clearing.
- DATA_UNAVAILABLE through row/chart unavailable states.
- INVALID_SYMBOL through add-symbol validation.
- EMPTY_WATCHLIST through empty state.

Fixes ensure unavailable rows do not display valid-looking price, percent change, confidence, risk, or current timestamp values.

## Responsive Findings

Smoke-tested unauthenticated protected-route surfaces:

- Desktop: PASS.
- Tablet: PASS.
- Mobile portrait: PASS.
- Mobile landscape: PASS.

No blank screen, visible `NaN`, visible `undefined`, or horizontal overflow was detected on the redirect surface.

Authenticated responsive validation of the full watchlist table/chart requires an approved Supabase operator session.

## Accessibility Findings

Implemented:

- Watchlist rows are keyboard selectable.
- Selected row has visual selected state.
- Add input and button are keyboard accessible.
- Remove controls are native buttons with `aria-label`.
- Error messages render as readable text.
- Provider/source/session/validation states are text, not color-only.
- Unavailable change state uses neutral color and `--`.

Remaining limitation:

- The table is built with `div` grid rows rather than semantic `<table>` markup. Labels are visible, but full table semantics remain partial.

Accessibility: PARTIAL.

## Performance Findings

Implemented:

- Provider polling uses one 60-second interval and clears on unmount.
- Chart fetch runs only on selected symbol/timeframe changes.
- Chart stale responses are ignored after effect cleanup.
- Removed symbols stop appearing in provider request symbol arrays after state update.
- Chart instance lifecycle remains handled by P.2 `MarketPriceChart`.

Remaining limitation:

- Quote/signals and selected chart make separate provider-route calls for the selected symbol. This is acceptable for current scale but could be batched in a future optimization.

Performance Safety: PASS.

## Scenario Matrix

| Scenario | Result |
|---|---|
| Valid symbol added | PASS by code audit. |
| Duplicate symbol | PASS; explicit duplicate message. |
| Invalid symbol | PASS; `INVALID_SYMBOL`. |
| Provider offline | PASS; rows clear to unavailable. |
| Backend offline | PASS; rows clear to `BACKEND_UNAVAILABLE`. |
| Stale quote | PASS; blocked/degraded through source metadata. |
| Market closed | PASS; provider market/session state remains explicit. |
| Rapid symbol switching | PASS by effect cleanup and state clearing. |
| Symbol removed while selected | PASS; selection falls back or clears. |
| Empty watchlist | PASS; `EMPTY_WATCHLIST`. |
| Reload page | PASS for local symbols; selected symbol not separately persisted. |
| Mobile viewport | PASS on protected-route smoke; authenticated full UI remains unverified locally. |

## Defects Found

1. HIGH: Empty provider responses could leave prior valid-looking row values.
2. MODERATE: Invalid symbols were silently sanitized instead of rejected.
3. MODERATE: Empty watchlists had no explicit empty state.
4. MODERATE: Selected row did not display provenance/validation metadata.
5. LOW: Unavailable change values could inherit positive/negative styling.
6. LOW: Remove control was not a native button.

## Exact Fixes

Modified:

- `FrontendReact/src/pages/Watchlists.jsx`
- `FrontendReact/src/styles/Watchlists.css`

Fixes:

- Added blocked source-type checks for simulated, generated, unknown, unavailable, provider-offline, backend-unavailable, and invalid-timestamp records.
- Added Alpaca-only row acceptance for market quote data.
- Added explicit unavailable row construction.
- Changed provider empty-response handling to update rows to unavailable instead of returning early.
- Added backend-unavailable catch path.
- Added strict symbol validation.
- Added source type, session, data age, and validation fields to selected row details.
- Added neutral unavailable change styling.
- Added explicit empty/no-match state.
- Converted remove control to native `button` with `aria-label`.

## Remaining Gaps

- Watchlists are local-only, not Supabase-persisted.
- Named custom watchlists are not implemented.
- Rename, delete-list, and manual reorder workflows are not implemented.
- Authenticated full UI smoke and chart visual QA require an approved Supabase operator session.
- Company names/categories are local static metadata.
- Watchlists do not hand off selected symbols to Signals/Replay through route state yet.

## Feature Classification

Overall Watchlists classification: PARTIAL.

Rationale:

- Core single-list workflow is usable and safer after fixes.
- Raw market values and chart data are connected through backend/provider routes and validation controls.
- Persistence is local-only.
- Multi-list management and authenticated visual workflow validation remain incomplete.

## Build and Smoke Results

Build command:

```powershell
npm.cmd run build
```

Build result: PASS.

Smoke:

- Started Vite with `npm.cmd run dev -- --host 127.0.0.1 --port 5174 --strictPort` outside the sandbox after sandboxed startup hit Windows `spawn EPERM`.
- `/watchlists` redirected safely to `/login` while unauthenticated.
- Desktop, tablet, mobile portrait, and mobile landscape redirect surfaces showed no blank screen, no visible `NaN`, no visible `undefined`, and no horizontal overflow.
- No local dev server listener remained after cleanup.

Smoke Test: PASS.

## P.3 Result

PASS.

Watchlists Product Readiness: PARTIAL.

## Recommended P.4 Step

P.4 Signals Audit.
