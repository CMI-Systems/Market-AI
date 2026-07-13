# Staging Security Hardening v1 Final Certification

## Purpose

This document summarizes the staging-security baseline for future Market AI, ChatGPT, Codex, Claude Code, and other coding-agent sessions. It is documentation-only and does not apply migrations or modify any database.

## Staging Target

- Project name: `market-ai-staging`
- Project ref: `ilogukxgdhqymgxpxejr`

## Safety Status

- Production: UNTOUCHED
- Training: OFF
- Shadow Trainer: OFF
- Brain Learning: OFF
- Controlled Learning: OFF
- Autonomous Learning: OFF

No learning system may be enabled without explicit approval.

## Certification Baseline

AI-DATABASE staging hardening is documented as completed and certified for the staging-hardening package. This baseline should be treated as project memory, not as live database proof. Future agents must verify live staging state with approved read-only checks before making operational decisions.

## What Staging Hardening Means

The staging-hardening program is intended to ensure:

- Staging remains separate from production.
- Production credentials are not used for staging.
- Public access is narrowed.
- Service-role access is scoped.
- RLS and policy boundaries are reviewed.
- Audit and evidence records are protected.
- Training and learning remain disabled.
- Shadow Trainer remains disabled.
- Brain Learning remains disabled.
- AI-DATABASE migration decisions remain separate approval gates.

## Local Market AI Artifacts

The Market AI repository has local staging planning artifacts under `supabase/migrations_drafts`, including:

- `001_aicc_persistence_schema_draft.sql`
- `002_aicc_persistence_schema_staging_ready.sql`
- `003_staging_least_privilege_grants.sql`
- `STAGING_READINESS_CERTIFICATION.md`
- `STAGING_CONNECTIVITY_VALIDATION.md`
- `STAGING_DEPLOYMENT_PLAN.md`
- `STAGING_EXECUTION_CHECKLIST.md`
- `DATASET_GOVERNANCE_POLICY.md`

These are local documentation/draft artifacts. They do not replace live staging verification.

## Current Migration 011 Boundary

Draft Brain Layer Migration 011 exists for review only from this baseline. Migration 011 has not been approved for application here.

Future agents must not apply Migration 011 unless explicitly instructed, target-verified, and operating under the correct branch and staging project.

## Required Verification Before Future Database Work

Before any Supabase write or migration work:

1. Confirm repository root.
2. Confirm branch.
3. Confirm git status.
4. Confirm target project is `market-ai-staging` / `ilogukxgdhqymgxpxejr`.
5. Confirm production connection strings are not used.
6. Confirm Training, Shadow Trainer, Brain Learning, Controlled Learning, and Autonomous Learning are OFF.
7. Run read-only inventory/security/compatibility checks when available.
8. Obtain explicit approval for any database mutation.

## Certification Caveat

This document is a documentation baseline. It should not be used as proof that staging is currently safe without fresh verification.
