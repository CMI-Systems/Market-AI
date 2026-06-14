# AICC Dataset Governance Policy

Policy version: N8-v1

## Governance Purpose

The dataset governance layer evaluates persisted AICC dataset records for ownership, completeness, validation quality, shadow readiness, retention status, and future training eligibility. It is a visibility and control layer only.

## Operator Ownership Requirements

Each governed dataset must remain scoped to the authenticated operator through Supabase Row Level Security. Dataset records must include an operator owner, and ownership must not be bypassed by frontend code, service role credentials, or backend shortcuts.

## Dataset Completeness Requirements

A dataset is complete only when it includes:

- Operator ownership
- Symbol
- Intelligence snapshot
- Operator context
- Market context
- Tactical learning target
- Behavioral learning target
- Failsafe learning target

Incomplete or partial datasets require review before any future learning pipeline may consider them.

## Review Rules

Review is required when:

- Dataset validation is missing
- Shadow readiness is missing
- Dataset ownership is missing or mismatched
- Dataset completeness is partial or incomplete
- Stored validation no longer matches recalculated validation
- Stored readiness no longer matches recalculated readiness
- Dataset or linked records contain warnings
- Dataset is marked restricted

## Retention Classifications

ACTIVE means the dataset is complete, within the retention window, and has no active review requirement.

ARCHIVE_CANDIDATE means the dataset exceeds the configured retention window and has no active review requirement.

HOLD means the dataset has warnings, inconsistent validation, missing ownership, or any review requirement.

No automatic deletion is authorized. No automatic archiving is authorized.

## Deletion Policy

Dataset governance never deletes records. Any future deletion workflow must require explicit product approval, operator safety review, and RLS validation.

## Training Eligibility Policy

No dataset is approved for actual training during Phase N.8. Future training eligibility may only become true after all of the following are true:

- Dataset governance status is COMPLIANT
- Dataset validation is valid
- Dataset validation accepted the record for shadow-training consideration
- Shadow readiness is true
- Ownership is valid
- Dataset completeness is COMPLETE
- Phase O Raw Data Certification is complete
- Training is explicitly enabled

Phase O Raw Data Certification is required before any training eligibility can be authorized.

## Security Model

Governance depends on authenticated operator ownership, Supabase RLS, and frontend use of anon credentials only. Service role keys must not be exposed to the frontend.

## RLS Dependency

All reads must respect Supabase RLS. Operators may only view and evaluate their own dataset records and linked validation/readiness records.

## Production Restrictions

Production deployment remains unapproved. Do not use production credentials, production operators, or production data for Phase N.8 governance validation.

## Explicit Non-Authorization

- No automatic deletion
- No automatic archiving
- No training authorization
- No Shadow Trainer activation
- No brain learning activation
- No production deployment approval
