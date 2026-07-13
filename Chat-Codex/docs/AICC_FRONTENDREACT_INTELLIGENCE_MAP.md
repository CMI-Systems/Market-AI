# AICC FrontendReact Intelligence Map

## Purpose

FrontendReact is the active face of Market AI / AICC. The original Frontend is historical/reference material only.

Market AI is a real-time operator intelligence platform. It is not a traditional trading dashboard.

## UI Module Map

| FrontendReact Module | Role | Intelligence Boundary |
|---|---|---|
| Command Center | Operator-facing intelligence summary and priority state. | Displays curated outputs only; deep diagnostics belong elsewhere. |
| Global Scan | Broad opportunity, risk, breadth, and cross-market scanning. | Requires provider-backed market and scan data. |
| Market Pulse | Environment, pulse, pressure, liquidity, and institutional context. | Depends on validated market/cognition inputs. |
| Data Streams | Provider state, stream health, provenance, and diagnostics. | Correct home for data and pipeline diagnostics. |
| Market Intelligence | Deeper intelligence summaries and market-context analysis. | Should be generated from validated intelligence layers. |
| Newsletter | Operator-readable intelligence communication. | Should use Narrative Engine outputs and disclose limits. |
| Intelligence Spotlight | Highlighted intelligence events and high-value context. | Should not fabricate current-market claims from unavailable data. |
| Replay Center | Persistent intelligence memory and replay review. | Long-term memory, explainability, and behavior analysis. |
| Trading Journal | Free/core operator journaling utility. | Premium value comes from intelligence derived from journal data. |
| Settings | Runtime, provider, auth, system, and configuration controls. | Deep system controls live here, not in Command Center. |
| Tactical Brain | Tactical market intelligence. | Consumes validated market structure and tactical signals. |
| Behavioral Brain | Operator behavior and decision-quality intelligence. | Consumes journal/replay/operator evidence. |
| Failsafe Brain | Provenance, risk, validation, and block/degrade state. | Blocks unsafe intelligence and protects decision support. |

## Active Route Context

FrontendReact routes are defined in `FrontendReact/src/App.jsx`. Current route families include:

- `/` and `/command-center`
- `/global-scan`
- `/market-pulse`
- `/data-streams`
- `/newsletter`
- `/replay-center`
- `/trading-journal`
- `/tactical-brain`
- `/behavioral-brain`
- `/failsafe-brain`
- `/system-settings` and `/settings`

## Intelligence Pipeline Context

```text
Market Data
  -> Validation
  -> Data Integrity
  -> Provenance
  -> Specialized Engines
  -> Tactical / Behavioral / Failsafe Brains
  -> Alignment
  -> Conflict Detection
  -> Consensus
  -> Regime
  -> Narrative
  -> Operator Briefing
  -> Command Center
```

## Command Center Rule

The Command Center should display high-signal intelligence outputs:

- Current operating state.
- Confidence and limitations.
- Priority risks.
- Consensus summary.
- Recommended operator attention areas.

It should not become a dump for provider diagnostics, raw logs, deep brain internals, schema state, migration state, or system administration details.

## Pending Backend Cognition Endpoints

Future backend/API work should continue formalizing endpoints for:

- Cognition overview.
- Brain status.
- Consensus and confidence.
- Strategic environment.
- Liquidity pressure.
- Institutional flow.
- Priority feed.
- Temporal memory.
- Recurrence.
- Persistent cognition memory.
- Adaptive signals.
- Replay intelligence.
- Dataset governance and certification reads from AI-DATABASE.

When endpoints are missing or unavailable, FrontendReact should show explicit unavailable states, not demo intelligence in staging or production-like modes.
