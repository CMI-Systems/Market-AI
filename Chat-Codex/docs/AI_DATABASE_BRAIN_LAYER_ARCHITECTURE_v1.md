# AI-DATABASE Brain Layer Architecture v1

## Purpose

AI-DATABASE is the database, governance, certification, security, replay persistence, dataset persistence, future training archive, and migration-management infrastructure for the CMI Systems intelligence platform.

Market-AI consumes deployed AI-DATABASE infrastructure. Market-AI should not absorb database ownership or bypass governance controls.

## Brain Layer Architecture

Long-term intelligence flow:

```text
Market Data
  -> Validation
  -> Data Integrity
  -> Provenance
  -> Specialized Engines
  -> Three Brain System
  -> Alignment Engine
  -> Conflict Detection
  -> Consensus Engine
  -> Consensus Weighting
  -> Consensus Confidence
  -> Confidence Calibration
  -> Regime Engine
  -> Narrative Engine
  -> Operator Briefing
  -> Command Center
```

## Specialized Engines

The specialized intelligence engines convert validated, provenance-preserving inputs into scoped intelligence signals:

- Structure
- Trend
- Momentum
- Liquidity
- Volatility
- Participation
- Leadership
- Relative Strength
- Rotation
- Narrative
- Risk

These engines should not replace validation, provenance, or failsafe checks. They should fail closed when inputs are missing, simulated, stale, generated, unknown-source, or contradictory.

## Three Brain System

### Tactical Brain

Tactical Brain evaluates validated market conditions, structure, momentum, liquidity, volatility, participation, rotation, leadership, relative strength, and timing. It produces tactical intelligence, not autonomous trading actions.

### Behavioral Brain

Behavioral Brain evaluates operator behavior, journal data, replay data, consistency, decision quality, hesitation, discipline, and recurring behavior patterns. Behavioral data does not replace market data.

### Failsafe Brain

Failsafe Brain evaluates risk, provenance, source quality, validation failures, uncertainty, conflicts, missing data, stale data, simulated data, generated data, and activation boundaries. It can block or downgrade intelligence but must not activate learning.

## Higher-Level Intelligence

### Alignment Engine

The Alignment Engine verifies whether Tactical, Behavioral, and Failsafe outputs are compatible or misaligned.

### Conflict Detection

Conflict Detection identifies contradictory signals, unstable evidence, missing inputs, or operator-action risk.

### Consensus Engine

Consensus Engine synthesizes specialized outputs only when enough validated inputs exist. It must degrade or block when required sources are unavailable.

### Consensus Weighting

Consensus Weighting adjusts influence based on confidence, reliability, recency, source quality, and risk.

### Consensus Confidence

Consensus Confidence reports how strongly the system can support a given interpretation.

### Confidence Calibration

Confidence Calibration prevents overconfident outputs from weak, partial, or inconsistent evidence.

### Regime Engine

Regime Engine classifies broader market regime from validated market context. It must not infer live regime from unsafe data.

### Narrative Engine

Narrative Engine translates verified intelligence into operator-readable context and explicitly discloses limitations.

## Long-Term Architecture Layers

```text
Data Layer
  -> Intelligence Layer
  -> Consensus Layer
  -> Cognition Layer
  -> Memory Layer
  -> Governance Layer
  -> Learning Layer
```

Operator-facing intelligence terminates at Cognition. Learning remains disabled until governance approval.

## Data Separation

### Market Data

Provider-backed quotes, candles, trades, market session state, provider diagnostics, volume, breadth, volatility, liquidity, and market structure.

### Behavioral Data

Journal entries, replay sessions, operator decision records, review notes, behavioral patterns, and discipline evidence.

### Risk Data

Failsafe state, risk escalation, reliability caps, data-quality warnings, conflict state, governance status, and blocked reasons.

### Context Layer

Development history, architecture decisions, docs, release notes, and system context. The Context Layer supports continuity but does not replace market data, behavioral data, or risk data.

## Proposed Schemas

- `market`: market observations, provider identity, validation state, and market context.
- `decision`: operator decisions, journal-derived decision context, reviewed trade context, and behavior evidence.
- `ai`: governance, brain runs, consensus events, certification, and AI dataset controls.
- `cognition`: replay memory, cognition memory, long-term context, and reviewed intelligence events.
- `training`: future training manifests, learning governance, training archive, and fail-closed readiness metadata.

## Learning Policy

Training, Shadow Trainer, Brain Learning, Controlled Learning, and Autonomous Learning remain OFF unless explicitly authorized.

Certification precedes learning. No dataset, replay record, brain output, or memory artifact should become training-eligible without governance approval.

## Migration 011 Status

Draft Brain Layer Migration 011 exists for review only from this Market AI baseline. It is not approved for application here. Future agents must verify the current AI-DATABASE repository and staging project state before making any claim about live migration status.
