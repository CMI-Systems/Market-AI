# Group A Frontend Consumption Plan

## 1. Purpose

This plan defines how FrontendReact may consume Market AI Backend Group A read-service DTOs without changing AICC architecture. It is planning only and does not implement UI, Backend changes, Supabase changes, provider integrations, migrations, deployment, or learning/training behavior.

Verified Backend baseline:

- Branch: `market-ai-staging`
- Backend implementation commit: `d776cbb4`
- Backend behavior owner review: PASS - safe for FrontendReact consumption planning

AICC architecture remains unchanged.

## 2. Scope

Allowed planning scope:

- read-only frontend consumption
- provider health display
- market context digest display
- fail-closed UI states
- operator-facing status cards or panels
- no trading execution
- no autonomy
- no training activation

Not allowed:

- backend changes
- Supabase changes
- new migrations
- provider expansion
- raw payload display
- hidden reasoning display
- learning, training, or autonomy controls
- execution buttons
- architecture redesign

## 3. Endpoint Consumption Map

### `GET /api/provider-health`

- Intended frontend use: provider/system health overview for an authenticated operator.
- Expected safe states: available, fresh, delayed, stale, unavailable, unknown, unauthorized, rate limited.
- Fail-closed UI behavior: show provider health as unavailable or not ready; do not infer market signal.
- Refresh recommendation: conservative polling or manual refresh.
- AICC Command Center display: YES, as status rail or system intelligence panel content.
- Auth requirement: hidden behind operator authentication.

### `GET /api/provider-health/:provider`

- Intended frontend use: provider-specific detail card or drawer after operator selection.
- Expected safe states: available, fresh, delayed, stale, unavailable, unknown, unauthorized, rate limited, not found.
- Fail-closed UI behavior: show the provider as unavailable from an approved source.
- Refresh recommendation: manual or low-frequency refresh.
- AICC Command Center display: YES, as an optional provider detail view.
- Auth requirement: hidden behind operator authentication.

### `GET /api/market-context/digests`

- Intended frontend use: future digest list when approved normalized digest persistence exists.
- Expected safe states: unavailable until an approved normalized source exists, then fresh, delayed, stale, unknown, unauthorized, rate limited.
- Fail-closed UI behavior: show no digest data available; do not fabricate summaries.
- Refresh recommendation: manual fetch with pagination after implementation approval.
- AICC Command Center display: YES, only after approved data source and UI copy review.
- Auth requirement: hidden behind operator authentication.

### `GET /api/market-context/digests/latest`

- Intended frontend use: latest market context digest card.
- Expected safe states: unavailable/stale until approved normalized digest persistence exists, then fresh, delayed, stale, unknown, unauthorized, rate limited.
- Fail-closed UI behavior: show latest digest unavailable and keep AICC decision surfaces neutral.
- Refresh recommendation: manual or conservative polling.
- AICC Command Center display: YES, as a market context card after approval.
- Auth requirement: hidden behind operator authentication.

### `GET /api/market-context/digests/:id`

- Intended frontend use: on-demand digest detail drawer.
- Expected safe states: available, stale, unavailable, unknown, unauthorized, rate limited, invalid request.
- Fail-closed UI behavior: show digest unavailable or invalid; do not display raw source material.
- Refresh recommendation: on-demand only.
- AICC Command Center display: YES, as an optional detail drawer after approval.
- Auth requirement: hidden behind operator authentication.

## 4. DTO Handling Rules

FrontendReact must:

- consume DTOs as read-only;
- trust the Backend redaction boundary without bypassing it;
- avoid inferring execution signals from health or digest status;
- never display raw provider payloads;
- never display internal stack traces;
- never display secret-like values;
- never display hidden reasoning;
- avoid persistent browser storage for DTOs unless separately approved;
- never convert unavailable or stale status into bullish or bearish signal.

## 5. UI State Model

| State | User-facing label | Safe description | Severity recommendation | Action allowed |
| --- | --- | --- | --- | --- |
| `loading` | Loading | Request is in progress. | neutral | No execution action. |
| `available/fresh` | Current | Backend reports current approved read data. | normal | Read-only inspect. |
| `delayed` | Delayed | Data is approved but not current. | caution | Read-only inspect with delay label. |
| `stale` | Stale | Data is too old for current operational confidence. | warning | Read-only inspect only. |
| `unavailable` | Unavailable | Approved source is missing or not ready. | warning | No derived action. |
| `unknown` | Unknown | Freshness cannot be determined safely. | caution | No derived action. |
| `unauthorized` | Sign in required | Operator authentication is missing or invalid. | blocked | No data display. |
| `rate_limited` | Try again later | Request was limited by route-local guard. | caution | Retry after delay only. |
| `error_redacted` | Unable to load | Error details were redacted for safety. | warning | No raw error display. |

## 6. Suggested UI Placement

Planning-only placement:

- AICC Command Center status rail or system intelligence panel.
- `ProviderHealthCard` for provider/system status.
- `MarketContextDigestCard` for latest approved digest state.
- Optional `DigestDetailDrawer` for digest metadata.
- No trade execution placement.
- No autonomous action placement.

## 7. Refresh Strategy

- Provider health: conservative polling or manual refresh.
- Provider-specific health: manual or low-frequency refresh.
- Latest digest: manual or conservative polling.
- Digest list: manual fetch with pagination.
- Digest by ID: on-demand only.
- `401`: show authenticated-operator requirement and stop polling.
- `429`: show rate-limited state and back off.
- `503` or unavailable: show fail-closed unavailable state and avoid signal inference.

## 8. Security And Privacy

- No secrets in FrontendReact.
- No privileged database role in FrontendReact.
- No provider credentials in FrontendReact.
- No raw provider payload display.
- No persistent browser storage unless separately approved.
- No internal error exposure.
- Auth-required consumption only.
- No unauthenticated public display.

## 9. Contract Alignment Checklist

Before UI implementation:

- [ ] Provider health DTO fields reviewed.
- [ ] Market context digest DTO fields reviewed.
- [ ] Validation rules mapped to UI states.
- [ ] Redaction rules mapped to rendering rules.
- [ ] Freshness rules mapped to labels and severity.
- [ ] Fail-closed response contract mapped to fallback states.
- [ ] Backend consumption boundary confirmed.
- [ ] Owner approval gate confirmed.

## 10. Implementation Readiness Gate

FrontendReact implementation requires separate owner approval after this plan.

Implementation must not begin until:

- this plan is reviewed;
- target UI components are selected;
- auth consumption behavior is verified;
- error-state copy is approved;
- no architecture change is confirmed.

## 11. Recommended Implementation Sequence

Planning-only sequence:

1. Create frontend API client wrappers.
2. Create DTO type guards or validators.
3. Create redacted error handler.
4. Create `ProviderHealthCard`.
5. Create `MarketContextDigestCard`.
6. Create optional `DigestDetailDrawer`.
7. Create tests and mocks for stale, unavailable, `401`, `429`, and redacted error states.
8. Integrate into AICC Command Center only after explicit approval.

## 12. Explicit Locks

- AICC architecture unchanged.
- Frontend consumption is read-only.
- Training OFF.
- Shadow Trainer OFF.
- Brain Learning OFF.
- Controlled Learning OFF.
- Autonomous Learning OFF.
