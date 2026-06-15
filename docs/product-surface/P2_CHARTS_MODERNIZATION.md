# AICC Phase P.2 - Professional Charts Modernization

Date: 2026-06-15

Mode: Implementation with validated market-data boundaries

Result: PASS with PARTIAL product readiness.

## Executive Summary

P.2 replaced the primary AICC price-chart surfaces with TradingView Lightweight Charts while preserving the existing non-price intelligence visualizations.

The implementation uses the official `lightweight-charts` package directly, without a React wrapper. Financial chart data is routed through a new frontend chart adapter that consumes backend provider routes, rejects unsafe records, preserves provenance metadata, and displays explicit unavailable/degraded states.

No Webull data was connected. No trading, order entry, training, Shadow Trainer, Brain Learning, Supabase schema, RLS, provider credential, or deployment setting changes were made.

## Existing Chart Audit

| Surface | Existing State | Classification | P.2 Action |
|---|---|---|---|
| `CommandCenter.jsx` primary chart | Hand-rendered candle divs using provider candles and zero fallbacks in rendering math | MIGRATE_TO_LIGHTWEIGHT_CHARTS | Replaced with `MarketPriceChart` |
| `CommandCenter.jsx` secondary chart | Hand-rendered candle divs using provider candles and zero fallbacks in rendering math | MIGRATE_TO_LIGHTWEIGHT_CHARTS | Replaced with `MarketPriceChart` |
| `Signals.jsx` market chart | Hand-rendered candle and volume divs; previously referenced local market-data helpers | MIGRATE_TO_LIGHTWEIGHT_CHARTS | Replaced with `MarketPriceChart` and validated adapter |
| `Signals.jsx` static signal markers | Static local marker helper | REMOVE_PLACEHOLDER | Removed from chart path; provider signal markers require timestamp and price |
| `Watchlists.jsx` selected-symbol chart | Not implemented | NOT_IMPLEMENTED | Added validated selected-symbol chart |
| `ReplayCenter.jsx` replay chart context | Not implemented | NOT_IMPLEMENTED | Added partial validated provider-candle context |
| `MarketOverviewPanel.jsx` | Static hardcoded market cards, orphaned from active routes | REMOVE_PLACEHOLDER | Documented as remaining placeholder/orphaned surface |
| Non-price metric bars and status panels | CSS dashboard visualizations | KEEP_RECHARTS / KEEP_DASHBOARD_VISUALS | Left unchanged for later feature audits |

## Architecture Decision

Financial price charts now use TradingView Lightweight Charts:

- Candlestick series.
- Volume histogram.
- Optional line series.
- Crosshair, zoom, pan, fit-content, and reset controls.
- Optional validated markers.

Dashboard and intelligence visualizations remain separate from financial charting. The current repository does not have Recharts installed, so P.2 did not add it. Recharts remains the intended library for future non-price dashboard visualizations where appropriate.

## Library Usage

Installed in `FrontendReact`:

- `lightweight-charts@^5.2.0`

Files changed by package install:

- `FrontendReact/package.json`
- `FrontendReact/package-lock.json`

## Components Created

Created:

- `FrontendReact/src/components/charts/MarketPriceChart.jsx`
- `FrontendReact/src/components/charts/MarketPriceChart.css`

`MarketPriceChart` supports:

- Single chart instance lifecycle.
- Cleanup on unmount.
- `ResizeObserver`-based resizing.
- Candlestick and line chart modes.
- Volume visibility toggle.
- Marker visibility toggle.
- Symbol and timeframe controls.
- Fit-content and reset-view controls.
- Explicit loading, unavailable, stale, partial, provider-offline, and market-closed states.
- Accessible title, textual summary, and non-color status labels.

## Data Flow

Implemented chart flow:

Alpaca
-> backend market provider service
-> backend market-data validation
-> backend market routes
-> `marketProviderApi`
-> `chartDataService`
-> `MarketPriceChart`

Created:

- `FrontendReact/src/services/chartDataService.js`

Exports:

- `CHART_TIMEFRAMES`
- `normalizeChartTimeframe(timeframe)`
- `normalizeChartCandles(records, options)`
- `getValidatedChartData(symbol, timeframe, options)`
- `getChartDataStatus(result)`

Supported timeframes:

- `1Min`
- `5Min`
- `15Min`
- `1Hour`
- `1Day`

Legacy aliases `1H` and `1D` are normalized to `1Hour` and `1Day`.

## Validation Controls

`chartDataService` rejects or blocks:

- Missing symbol.
- Unsupported timeframe.
- Non-Alpaca provider records.
- Mixed symbols.
- Mixed providers.
- Missing timestamps.
- Future timestamps.
- Invalid OHLC.
- Invalid volume.
- Duplicate timestamps.
- Out-of-order candles.
- Unavailable records.
- Simulated records.
- Generated records.
- Provider-unavailable records.
- Unknown-source records.

The chart component does not normalize provider payloads directly. It consumes already-adapted chart candles.

## Provenance Display

Each financial chart displays:

- Symbol.
- Timeframe.
- Provider.
- Source type.
- Market session.
- Provider timestamp.
- Data age.
- Validation status.
- Quality label.

Visible statuses supported:

- LIVE
- DELAYED
- CACHED
- STALE
- PARTIAL
- MARKET CLOSED
- PROVIDER OFFLINE
- DATA UNAVAILABLE

LIVE is only displayed when the provenance source type supports it.

## Command Center Integration

Updated:

- `FrontendReact/src/pages/CommandCenter.jsx`
- `FrontendReact/src/styles/CommandCenter.css`

Result: READY.

Changes:

- Replaced both hand-built overview charts with `MarketPriceChart`.
- Routed primary and secondary symbols through `getValidatedChartData`.
- Cleared prior candle and quote state during symbol/timeframe reloads.
- Preserved AICC intelligence inputs only when validated market candles and quote are available.
- Removed the old zero-substituting chart-render path.
- Made the chart grid responsive for the new component.

## Watchlist Integration

Updated:

- `FrontendReact/src/pages/Watchlists.jsx`
- `FrontendReact/src/styles/Watchlists.css`

Result: READY.

Changes:

- Added a selected-symbol professional chart.
- Selecting a watchlist row updates the chart symbol.
- Previous candles are cleared during reload.
- Failed symbol loads show unavailable state instead of stale prior-symbol candles.
- Timeframe controls use the certified provider boundary.

## Signals Integration

Updated:

- `FrontendReact/src/pages/Signals.jsx`
- `FrontendReact/src/styles/Signals.css`

Result: PARTIAL.

Changes:

- Replaced hand-built candle and volume strips with `MarketPriceChart`.
- Removed chart use of local static candle and quote helpers.
- Static marker fixtures no longer drive chart markers.
- Provider signal markers are shown only when a provider signal supplies timestamp and price.

Remaining limitation:

- Provider signal marker payloads are not consistently timestamped with chart candles yet, so marker rendering remains partial.

## Replay Integration

Updated:

- `FrontendReact/src/pages/ReplayCenter.jsx`
- `FrontendReact/src/styles/ReplayCenter.css`

Result: PARTIAL.

Changes:

- Added replay chart context for the selected replay symbol.
- Chart uses validated provider candles only.
- Entry and exit markers are not drawn from static sample trades.

Remaining limitation:

- Full replay marker support requires persisted replay timestamps and validated operator trade prices.

## Responsive Results

Implemented:

- Chart container resizes with `ResizeObserver`.
- Controls wrap on narrow widths.
- Metadata grid collapses from six columns to three and then one.
- Chart grid in Command Center no longer uses fixed wide minimum columns.
- Watchlists and Replay chart wrappers respect page width.

Smoke result:

- Mobile protected-route smoke at 390x844 passed with no blank screen, no visible `NaN`, no visible `undefined`, and no horizontal overflow on the unauthenticated redirect surface.

Authenticated chart visual QA was not available in the local environment because protected routes require a valid Supabase operator session.

## Performance Results

Implemented:

- Chart instance is created once and disposed on unmount.
- Series are updated without recreating the chart.
- `ResizeObserver` is disconnected on unmount.
- Marker plugin state is reused.
- Request stale-overwrite risk is reduced by clearing current state and ignoring unmounted responses.
- Candle request limit is bounded to 500 in the adapter and uses lower page-level limits.

No duplicated provider polling was introduced beyond existing page intervals and selected-chart fetches.

## Accessibility Results

Result: PARTIAL.

Implemented:

- Accessible chart section title.
- Textual market summary.
- Explicit provider/source/session/validation metadata.
- Keyboard-accessible native selects and buttons.
- Non-color status labels.

Remaining limitation:

- Canvas internals are not fully screen-reader semantic. The textual summary and metadata provide the accessible fallback.

## Scenario Validation

Direct adapter scenario checks:

| Scenario | Result |
|---|---|
| Valid candle series | VALID, candles accepted |
| Empty series | DATA_UNAVAILABLE |
| Invalid OHLC | INVALID_OHLC |
| Duplicate timestamps | DUPLICATE |
| Out-of-order timestamps | OUT_OF_ORDER |
| Mixed symbols | SYMBOL_MISMATCH |
| Stale data | STALE, chartable with degraded label |
| Cached data | CACHED display status |
| Delayed data | DELAYED display status |
| Simulated record | BLOCKED |
| Generated record | BLOCKED |
| Future timestamp | INVALID_TIMESTAMP |
| Unavailable record | BLOCKED |
| Unsupported provider | BLOCKED |

Smoke checks:

- `/signals` redirected safely to `/login` unauthenticated.
- `/command-center` redirected safely to `/login` unauthenticated.
- `/watchlists` redirected safely to `/login` unauthenticated.
- `/replay-center` redirected safely to `/login` unauthenticated.
- No console errors were captured on these protected-route checks.
- No blank screen, visible `NaN`, or visible `undefined` was detected.

## Files Created

- `FrontendReact/src/components/charts/MarketPriceChart.jsx`
- `FrontendReact/src/components/charts/MarketPriceChart.css`
- `FrontendReact/src/services/chartDataService.js`
- `docs/product-surface/P2_CHARTS_MODERNIZATION.md`

## Files Modified

P.2-modified files:

- `FrontendReact/package.json`
- `FrontendReact/package-lock.json`
- `FrontendReact/src/pages/CommandCenter.jsx`
- `FrontendReact/src/pages/Signals.jsx`
- `FrontendReact/src/pages/Watchlists.jsx`
- `FrontendReact/src/pages/ReplayCenter.jsx`
- `FrontendReact/src/styles/CommandCenter.css`
- `FrontendReact/src/styles/Signals.css`
- `FrontendReact/src/styles/Watchlists.css`
- `FrontendReact/src/styles/ReplayCenter.css`

Pre-existing Phase O/P.1 working tree changes were not reverted or rewritten.

## Build Result

Command:

```powershell
npm.cmd run build
```

Result: PASS.

Vite warning:

- Main JavaScript chunk exceeds 500 kB after minification. This is a size warning, not a build failure.

## Remaining Gaps

- Authenticated chart visual QA requires a valid Supabase operator session.
- Replay entry/exit markers require persisted replay timestamps and validated operator trade prices.
- Signal markers require provider signal timestamp and price payload consistency.
- `MarketOverviewPanel.jsx` remains a static orphaned placeholder surface.
- Real provider streaming remains uncertified and out of P.2 scope.
- Webull remains unsupported and unconnected.
- Non-price dashboard charts remain existing CSS-based visuals pending future audits.

## P.2 Result

PASS.

Charts product readiness is PARTIAL because the main financial chart system is implemented and build/smoke validation passed, but replay and signal markers remain partial and authenticated chart visual QA was not available locally.

## Recommended P.3 Step

P.3 Watchlists Audit.
