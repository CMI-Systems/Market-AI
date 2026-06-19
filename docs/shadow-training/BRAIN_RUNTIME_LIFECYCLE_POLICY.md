# Brain Runtime Lifecycle Policy

Date: 2026-06-16

## Backend Always-On Boundary

Backend intended state: ALWAYS_ON.

Readiness: READY_WITH_GAPS.

Documented requirements:

- startup on host reboot
- restart on failure
- duplicate-instance prevention
- graceful shutdown
- bounded logs
- health endpoint
- environment validation
- simulation remains blocked
- lifecycle coordinator starts safely
- brains default to SLEEPING or fail-closed state
- missing session policy cannot activate observation

No service manager, deployment setting, Vercel setting, Render setting, or production host configuration was changed during this phase.

Implemented policy service:

- `Backend/services/brain/brainRuntimeLifecycle.js`

Calendar/session authority:

`marketSessionPolicy -> brainRuntimeLifecycle -> allowed brain actions`

## Runtime States

- SLEEPING
- WARMING_UP
- ACTIVE_OBSERVATION
- DAILY_CLOSEOUT
- REST_AND_DAILY_REVIEW
- WEEKLY_SUBMISSION
- WEEKLY_REVIEW
- DEGRADED
- QUARANTINED
- HUMAN_REVIEW_REQUIRED

## Session Schedule

Approved schedule:

- One hour before pre-market: WARMING_UP
- Pre-market through regular-market close: ACTIVE_OBSERVATION
- After regular close through one hour before next pre-market: REST_AND_DAILY_REVIEW
- Friday after regular-market close: DAILY_CLOSEOUT -> WEEKLY_SUBMISSION -> WEEKLY_REVIEW
- Weekend: WEEKLY_REVIEW may continue

Implementation note:

WARMING_UP depends on `marketSessionPolicy` providing `nextOpen`. If verified next-open data is unavailable, the coordinator does not invent a separate schedule. PRE_MARKET and REGULAR_MARKET states still derive from `marketSessionPolicy`.

## Friday/Weekend Schedule

Friday after regular close:

1. DAILY_CLOSEOUT until daily ledger is finalized.
2. WEEKLY_SUBMISSION until weekly records are submitted.
3. WEEKLY_REVIEW after submission.

Weekend:

- WEEKLY_REVIEW may continue.
- No new market observation is allowed.

## Allowed Actions By State

SLEEPING:

- health checks
- diagnostics
- configuration validation
- ledger access
- administrative review

WARMING_UP:

- provider validation
- session validation
- mission-contract validation
- objective loading
- prior ledger loading
- provenance checks

ACTIVE_OBSERVATION:

- approved input ingestion
- non-authoritative observation
- daily ledger recording
- objective measurement
- provenance checks

DAILY_CLOSEOUT:

- finish in-flight validation
- calculate metrics
- finalize ledger
- submit completed records

REST_AND_DAILY_REVIEW:

- daily review
- comparison
- diagnostics
- next-session preparation
- ledger access

WEEKLY_SUBMISSION:

- submit finalized daily records
- verify completeness
- lock weekly record set

WEEKLY_REVIEW:

- aggregate records
- compare baseline
- detect regressions
- propose objectives
- human review

QUARANTINED:

- logging
- diagnostics
- human inspection
- human review

HUMAN_REVIEW_REQUIRED:

- logging
- diagnostics
- human inspection
- human review

## Blocked Actions By State

Universally blocked in pre-shadow lifecycle:

- authoritative output
- weight update
- training
- promotion
- live trading
- mission change
- objective approval
- objective activation
- record rewrite
- quarantine release

No new market observation may be compiled during:

- REST_AND_DAILY_REVIEW
- WEEKLY_SUBMISSION
- WEEKLY_REVIEW
- SLEEPING
- QUARANTINED
- HUMAN_REVIEW_REQUIRED

## Calendar Authority

The lifecycle coordinator uses `Backend/services/marketSessionPolicy.js`.

Current gap:

`marketSessionPolicy` can accept provider clock/calendar input, but provider holiday and early-close calendar verification is not built into a dedicated calendar provider. Without verified calendar data, schedule-sensitive transitions remain conservative and warnings are preserved.

## Restart Behavior

On backend restart:

- unknown session -> SLEEPING
- quarantined flag -> QUARANTINED
- humanReviewRequired flag -> HUMAN_REVIEW_REQUIRED
- degraded flag -> DEGRADED
- missing nextOpen -> no WARMING_UP unless session policy proves it

## Validation Result

Runtime Lifecycle Integrity: PASS.

Schedule Integrity: PASS_WITH_GAPS.

Market Calendar Authority: PASS_WITH_GAPS.

Direct scenario testing confirmed:

- UNKNOWN_SESSION -> SLEEPING
- PRE_MARKET -> ACTIVE_OBSERVATION
- REGULAR_MARKET -> ACTIVE_OBSERVATION
- Friday AFTER_HOURS without finalized ledger -> DAILY_CLOSEOUT
- WEEKEND -> WEEKLY_REVIEW
- one hour before known nextOpen -> WARMING_UP
- REST_AND_DAILY_REVIEW blocks market observation
- ACTIVE_OBSERVATION allows non-authoritative observation
- ACTIVE_OBSERVATION blocks training
