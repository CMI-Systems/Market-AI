# AICC Memory Governance v1

## Purpose

AICC memory exists to support replay, explainability, certification, operator improvement, and future training governance. Memory is not learning by default. Memory records should not modify behavior, activate training, or bypass human approval.

## Primary Memory Surface

Replay Center is the persistent intelligence memory system. It should preserve operator decisions, replay context, behavioral review, mistakes, lessons, and system explanations.

## Future Memory Engine Types

### Episodic Memory

Event-specific memory: what happened, when it happened, what the operator saw, what decision was made, what market state existed, and what outcome followed.

### Behavioral Memory

Operator-pattern memory: discipline, hesitation, overtrading, revenge trading, patience, consistency, strategy adherence, and improvement signals.

### Semantic Memory

Conceptual memory: definitions, regimes, playbooks, strategy concepts, provider capabilities, known limitations, and architecture rules.

### Procedural Memory

Workflow memory: how reviews are performed, how certification proceeds, how replay is processed, how journal records become intelligence, and how governance gates operate.

### Governance Memory

Audit and decision memory: certification records, approvals, rejections, blocked reasons, readiness state, release decisions, rollback decisions, and training-governance history.

## Governance Pipeline

Certification precedes learning:

```text
Raw Data Certification
  -> Dataset Validation
  -> Failsafe Certification
  -> Dataset Capture
  -> Shadow Queue
  -> Shadow Queue Certification
  -> Training Readiness
  -> Learning Infrastructure Audit
  -> Human Approval
  -> Training
```

Training is not active simply because data exists. Shadow queue records, replay records, and memory records are evidence only until governance explicitly approves learning.

## Memory Safety Rules

- Memory does not activate Training.
- Memory does not activate Shadow Trainer.
- Memory does not activate Brain Learning.
- Memory does not override Failsafe Brain.
- Memory does not bypass certification.
- Memory does not replace market data.
- Memory does not create autonomous behavior.
- Memory must preserve source, timestamp, operator context, and provenance.

## Replay Center Role

Replay Center should support:

- Decision reconstruction.
- Behavioral explanation.
- Mistake pattern review.
- Operator improvement loops.
- Dataset-candidate evidence.
- Future training archive support after approval.

Replay Center is not itself a learning system.

## Trading Journal Role

Trading Journal is a free/core platform utility. It captures operator decision data that can later support behavioral intelligence and replay. Premium value should come from analysis and intelligence derived from journal data, not from basic access to journaling.

## Future AI-DATABASE Memory Integration

AI-DATABASE should eventually own durable memory schemas for:

- Replay persistence.
- Cognition memory.
- Dataset certification.
- Governance audit.
- Training archive.
- Learning approval history.

Market-AI should consume these through approved services and APIs.

## Current Policy

Training: OFF.
Shadow Trainer: OFF.
Brain Learning: OFF.
Controlled Learning: OFF.
Autonomous Learning: OFF.

Do not enable any learning system without explicit approval.
