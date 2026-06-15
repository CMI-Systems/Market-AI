# AICC Phase O.4 - Market Data Validation

## Executive Summary

O.4 audited operational market-data validation for AICC after O.3 provider integrity work.

Result: PASS.

Alpaca remains the only operational provider path and is still conditionally verified. Webull remains not implemented and is not treated as a data source. During O.4, a certification-blocking gap was found: market-data validation existed only in localized provider normalization checks and was not centralized, series-aware, or preserved into AICC dataset governance.

Fixes were applied only to confirmed validation defects:

- Added centralized backend market-data validation.
- Wired quote and candle validation into Alpaca provider normalization.
- Added candle-series validation for chronology, duplicates, mixed symbols, and unusable records.
- Preserved market-data validation metadata in AICC dataset records.
- Updated dataset validation and governance so blocked, missing, simulated, generated, unavailable, invalid-timestamp, invalid-OHLC, duplicate, out-of-order, and unknown-source records cannot pass raw-data suitability checks.

Raw Data Certification remains NOT YET CERTIFIED. Training remains OFF.

## Canonical Data Contracts

### Quote

```js
{
  symbol,
  bidPrice,
  bidSize,
  askPrice,
  askSize,
  lastPrice,
  timestamp,
  provider,
  sourceType,
  available,
  simulated,
  generated
}
```

`bidPrice`, `bidSize`, `askPrice`, and `askSize` are optional for current Alpaca quote normalization. Missing optional bid/ask fields produce `PARTIAL_DATA`, not fabricated zeroes.

### Trade

```js
{
  symbol,
  price,
  size,
  timestamp,
  provider,
  sourceType,
  available,
  simulated,
  generated
}
```

### Candle / Bar

```js
{
  symbol,
  open,
  high,
  low,
  close,
  volume,
  timestamp,
  timeframe,
  provider,
  sourceType,
  available,
  simulated,
  generated
}
```

### Market Clock / Session

```js
{
  timestamp,
  sessionState,
  marketOpen,
  provider,
  sourceType
}
```

### Provider Status / Stream Event

Provider status and stream events must preserve provider identity, source type, availability, timestamp/provenance fields, and simulated/generated flags.

## Quote Validation

Implemented in `Backend/services/marketDataValidator.js` through `validateQuote(record, options)`.

Validated:

- Symbol presence and normalization.
- Provider identity.
- Recognized `sourceType`.
- Availability.
- `simulated` and `generated` flags.
- Timestamp validity and future timestamp rejection.
- Stale quote threshold.
- Positive last price where required.
- Non-negative bid/ask values and sizes when supplied.
- Crossed quote warning when ask is below bid.
- Optional bid/ask fields as `PARTIAL_DATA`.

Result: PASS.

## Trade Validation

Implemented through `validateTrade(record, options)`.

Validated:

- Symbol, provider, source type, availability, simulated/generated flags.
- Positive trade price.
- Non-negative size.
- Timestamp validity, future timestamp rejection, and stale threshold.

Result: PASS.

## Candle Validation

Implemented through `validateCandle(record, options)`.

Validated:

- Symbol and provider identity.
- Positive OHLC prices.
- Non-negative volume.
- Valid timestamp.
- Valid timeframe when required.
- OHLC relationship integrity:
  - `high >= open`
  - `high >= close`
  - `high >= low`
  - `low <= open`
  - `low <= close`
  - `low <= high`
- No `NaN`, `Infinity`, negative price, negative volume, or fabricated timestamp path.

Result: PASS.

## Series Validation

Implemented through `validateCandles(records, options)` and applied to Alpaca historical candles.

Validated:

- Empty series.
- Duplicate timestamps.
- Out-of-order timestamps.
- Mixed symbols.
- Mixed providers.
- Mixed timeframes.
- Minimum sample size.
- Invalid/unusable record exclusion with warnings.
- Stale series labeling without converting it to live/current data.

Blocking series statuses:

- `BLOCKED`
- `UNAVAILABLE`
- `UNKNOWN_SOURCE`
- `INVALID_TIMESTAMP`
- `INVALID_NUMERIC_DATA`
- `INVALID_OHLC`
- `SYMBOL_MISMATCH`
- `OUT_OF_ORDER`
- `DUPLICATE`

Result: PASS.

## Timestamp/Freshness Policy

Thresholds currently enforced in `marketDataValidator.js`:

| Data Type | Threshold |
|---|---:|
| Quote | 15 minutes |
| Trade | 15 minutes |
| Stream event | 60 seconds |
| 1Min candle | 5 minutes |
| 5Min candle | 20 minutes |
| 15Min candle | 45 minutes |
| 1Hour candle | 3 hours |
| 1Day candle | 3 days |

Policy:

- Provider timestamp and current receipt/evaluation time remain separate.
- Missing timestamps are blocked for time-sensitive records.
- Future timestamps are blocked.
- Stale records are labeled `STALE` and are not usable for full-confidence current/live intelligence.
- Stale values can remain structurally present with `STALE` provenance so downstream layers can disclose or block them explicitly.
- Current time is not substituted for missing provider timestamps.

Result: PASS.

## Numerical Integrity

Rejected or blocked:

- `NaN`
- `Infinity`
- Non-numeric values where numeric values are required.
- Negative prices.
- Negative volume.
- Zero last price used as a valid quote.
- Impossible OHLC relationships.
- Empty candle arrays as valid data.
- Low-scoring partial series marked as usable.

Result: PASS.

## Symbol Integrity

Validated:

- Empty symbols fail closed.
- Symbols normalize to uppercase.
- Expected-symbol mismatches are blocked.
- Mixed-symbol candle arrays are blocked.
- Provider data is not attached to a different requested symbol.

Result: PASS.

## Consistency Checks

Validated:

- Quote bid/ask plausibility.
- Candle OHLC consistency.
- Candle-series chronology.
- Provider identity consistency.
- Source-type preservation.
- Dataset metadata preservation of validation status.

Asynchronous endpoint equality is not required because quote, trade, and bar endpoints can legitimately update at different times.

Result: PASS.

## Partial Data Policy

Partial records produce:

- `PARTIAL_DATA`
- Reduced quality score.
- Warnings.
- No full-confidence guarantee.

Examples:

- Missing optional quote bid/ask fields.
- Crossed quote warning.
- Candle series with excluded unusable records.
- Fewer candle samples than required for reliable analysis.

Result: PASS.

## Stale Data Policy

Stale records produce:

- `STALE`
- Reduced quality score.
- `usable: false`
- Original timestamp retained.
- No live/current claim.

Stale data is not automatically treated as provider failure or simulation.

Result: PASS.

## Outlier Detection

Implemented O.4 blockers cover obvious corruptions:

- Price/volume invalidity.
- OHLC inversion.
- Duplicate timestamps.
- Out-of-order timestamps.
- Mixed symbols.
- Simulated/generated provenance.
- Unknown/unavailable provider state.

Remaining O.5/O.6 work should decide whether to add statistical outlier thresholds for large but possible market moves. O.4 does not rewrite or suppress legitimate volatility.

## Intelligence Suitability

Suitability policy:

| Validation Status | Tactical | Behavioral | Failsafe | Consensus/Regime/Narrative | Dataset Capture |
|---|---|---|---|---|---|
| `VALID` | SUITABLE | SUITABLE | SUITABLE | SUITABLE | Captured with validation metadata |
| `PARTIAL_DATA` | LIMITED | LIMITED | DEGRADED | LIMITED | Captured with warnings |
| `STALE` | LIMITED/UNSUITABLE for live momentum | LIMITED | DEGRADED/BLOCKED | Must disclose stale basis | Captured as not raw-certified |
| `UNAVAILABLE` | UNSUITABLE | UNSUITABLE | BLOCKED | UNAVAILABLE | Held/rejected |
| Critical invalid statuses | UNSUITABLE | UNSUITABLE | BLOCKED | UNAVAILABLE | Held/rejected |

Result: PASS.

## Quality Scoring

Implemented quality labels:

| Score | Label |
|---:|---|
| 90-100 | HIGH |
| 75-89 | ACCEPTABLE |
| 50-74 | DEGRADED |
| 1-49 | UNSUITABLE |
| 0 | BLOCKED |

Critical validation failures cap scores below 50. A score below 50 is not usable even if the issue is classified as partial.

Result: PASS.

## Dataset Integration

Updated:

- `FrontendReact/src/services/intelligence/aiccDatasetCapture.js`
- `FrontendReact/src/services/intelligence/aiccDatasetQualityValidator.js`
- `FrontendReact/src/services/datasetGovernanceService.js`

Dataset capture now preserves:

- `marketDataValidation`
- `qualityScore`
- `qualityLabel`
- `validationStatus`
- `validationErrors`
- `validationWarnings`
- `sourceType`
- `provider`
- `timestamp`
- `dataAge`
- `sessionState`
- `rawDataCertified: false`
- `trainingEligible: false`

Dataset validation and governance now reject or hold:

- `BLOCKED`
- `UNAVAILABLE`
- `DATA_UNAVAILABLE`
- `PROVIDER_UNAVAILABLE`
- `PROVIDER_OFFLINE`
- `UNKNOWN_SOURCE`
- `INVALID_TIMESTAMP`
- `INVALID_NUMERIC_DATA`
- `INVALID_OHLC`
- `SYMBOL_MISMATCH`
- `OUT_OF_ORDER`
- `DUPLICATE`
- `SIMULATED`
- `GENERATED`
- `UNSUITABLE`
- missing market-data validation

Training remains blocked by `RAW_DATA_CERTIFICATION_REQUIRED`.

Result: PASS.

## Scenario Matrix

Deterministic fixture validation tested 25 scenarios without live provider calls.

| Scenario | Result |
|---|---|
| Fully valid quote | `VALID`, usable |
| Quote missing optional bid | `PARTIAL_DATA`, usable with warning |
| Zero-valued fallback quote | `INVALID_NUMERIC_DATA`, unusable |
| Negative quote price | `INVALID_NUMERIC_DATA`, unusable |
| Ask below bid | `PARTIAL_DATA`, usable with warning |
| Invalid quote timestamp | `INVALID_TIMESTAMP`, unusable |
| Future quote timestamp | `INVALID_TIMESTAMP`, unusable |
| Stale quote | `STALE`, unusable for current/live confidence |
| Valid trade | `VALID`, usable |
| Negative trade size | `INVALID_NUMERIC_DATA`, unusable |
| Valid candle | `VALID`, usable |
| Candle high below close | `INVALID_OHLC`, unusable |
| Candle low above open | `INVALID_OHLC`, unusable |
| Negative candle volume | `INVALID_NUMERIC_DATA`, unusable |
| Duplicate candles | `DUPLICATE`, unusable |
| Out-of-order candles | `OUT_OF_ORDER`, unusable |
| Mixed-symbol candle array | `SYMBOL_MISMATCH`, unusable |
| Empty candle array | `UNAVAILABLE`, unusable |
| Partial latest candle | `PARTIAL_DATA`, low quality; not full-confidence |
| Valid delayed data | `VALID`, usable with delayed provenance |
| Valid cached data | `VALID`, usable only with cached provenance disclosure |
| Provider-offline response | `UNAVAILABLE`, unusable |
| Simulated/generated record | `BLOCKED`, unusable |
| Market clock | `VALID` |
| Stream event | `VALID` |

Result: PASS.

## Page-Level Validation

Page-level behavior was validated through import/build checks, existing explicit unavailable/provenance enforcement from O.2.3-O.2.6, and a protected-route browser smoke check.

Affected surfaces:

- Command Center
- Market Pulse
- Global Scan
- Signals
- Watchlists
- Data Streams
- Tactical Brain
- Failsafe Brain
- Replay Center

Expected behavior remains:

- No simulation fallback.
- No fabricated live quote/candle values.
- Invalid data is unavailable, blocked, or degraded.
- Operator tools remain usable.
- Quality/degraded state is preserved in provider and dataset metadata.

Result: PASS.

Protected-route smoke result:

- Local Vite route: `http://127.0.0.1:5177/replay-center`
- Result: unauthenticated access redirected to `/login`
- Render state: login screen rendered safely with `#root` mounted
- Runtime crash: none observed

## Issues Found

1. No centralized backend market-data validator existed.
2. Candle series did not have a dedicated chronology/duplicate/mixed-symbol quality gate.
3. Missing provider identity and missing symbol were not globally critical in market-data validation.
4. Stale records were initially treated as structurally unusable during series validation.
5. Low-scoring partial series could be marked usable.
6. Dataset capture did not preserve market-data validation metadata.
7. Dataset validation/governance could not hold records based on blocked market-data validation status.

## Exact Fixes

Created:

- `Backend/services/marketDataValidator.js`

Modified:

- `Backend/services/marketProviderService.js`
- `FrontendReact/src/services/intelligence/aiccDatasetCapture.js`
- `FrontendReact/src/services/intelligence/aiccDatasetQualityValidator.js`
- `FrontendReact/src/services/datasetGovernanceService.js`

Fix details:

- Added validators for quotes, trades, candles, candle series, market clock, stream events, and quality summaries.
- Added deterministic validation statuses and quality labels.
- Wired quote and candle validation into provider normalization.
- Added candle-series blocking for duplicate, out-of-order, mixed-symbol, invalid OHLC, invalid timestamp, unknown source, blocked, and unavailable states.
- Preserved structurally valid stale values with `STALE` provenance instead of silent null substitution.
- Prevented `UNSUITABLE` results from being marked usable.
- Added market-data validation fields to AICC dataset records.
- Updated dataset validator and governance to reject/hold missing or blocked market-data validation.

## Remaining Risks

- Alpaca is conditionally verified, not fully raw-data certified.
- Webull remains not implemented.
- Statistical outlier detection beyond deterministic corruption checks should be addressed during O.5/O.6 if required.
- Live provider entitlement/rate-limit behavior still needs continued staging observation.
- Raw Data Certification remains blocked until O.5 and O.6 complete.

## O.4 Result

Market Data Validation: PASS.

Validation controls are sufficient to proceed to O.5 Failsafe Data Certification.

## O.5 Readiness

O.5 Readiness: READY.

O.5 should focus on failsafe certification of validated raw-data paths and confirm that invalid, stale, partial, unavailable, simulated, generated, unknown-source, and certification-ineligible data cannot pass the final failsafe gate.

## Recommended Next Step

O.5 Failsafe Data Certification.

## Final Result

Market Data Validation: PASS

Validation Scenarios Tested: 25

Validation Defects Found: 7

Validation Defects Remaining: 0

Quote Validation: PASS

Trade Validation: PASS

Candle Validation: PASS

Series Validation: PASS

Timestamp Integrity: PASS

Freshness Enforcement: PASS

Numerical Integrity: PASS

Symbol Integrity: PASS

Partial Data Handling: PASS

Stale Data Handling: PASS

Intelligence Suitability: PASS

Dataset Validation Integration: PASS

Market Data Validation Readiness: READY

Raw Data Certification: NOT YET CERTIFIED

Recommended Next Step: O.5 Failsafe Data Certification
