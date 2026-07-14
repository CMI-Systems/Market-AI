# Group A FrontendReact Implementation Plan

## 1. Implementation Status

IMPLEMENTED ON `market-ai-staging` - remediation review remains in progress.

This document records the controlled Group A DTO consumption design now implemented in FrontendReact. The implementation remains read-only and does not modify Supabase, create migrations, deploy, alter AICC architecture, or activate learning/training.

## 2. Purpose

This plan defines the exact controlled frontend implementation path for consuming Group A Backend DTOs under the existing AICC architecture.

Approved Backend endpoints:

- `GET /api/provider-health`
- `GET /api/provider-health/:provider`
- `GET /api/market-context/digests`
- `GET /api/market-context/digests/latest`
- `GET /api/market-context/digests/:id`

Verified Backend baseline:

- Backend Group A implementation commit: `d776cbb4`
- Frontend consumption plan commit: `50baa2a8`
- Backend behavior owner review: PASS - safe for FrontendReact consumption planning

## 3. Existing FrontendReact Structure Review

### Current App Entry Points

- `FrontendReact/src/main.jsx` creates the React root and wraps the app in `BrowserRouter`.
- `FrontendReact/src/App.jsx` defines route registration with `react-router-dom`.
- Protected pages are wrapped by `ProtectedRoute`.

### Current Route And Layout Structure

- `/` and `/command-center` render `CommandCenter`.
- Other protected pages include Data Streams, Market Pulse, Tactical Brain, Behavioral Brain, Failsafe Brain, Signals, Replay Center, Profiles, and Settings.
- `CommandCenter.jsx` is the primary operator-facing AICC dashboard surface.

### Existing AICC Command Center Components

Existing reusable panel/card components live under `FrontendReact/src/components/`, including:

- `DataStreamsPanel.jsx`
- `MarketPulsePanel.jsx`
- `GlobalScanPanel.jsx`
- `TacticalBrainPanel.jsx`
- `BehavioralBrainPanel.jsx`
- `FailsafeBrainPanel.jsx`
- `SystemOnlinePanel.jsx`

`CommandCenter.jsx` imports these components and also contains several inline command-center sections and cards.

### Existing API And Client Utilities

Existing frontend API clients live under `FrontendReact/src/services/` and use a consistent pattern:

- build URLs from the shared `VITE_API_URL` helper, with a localhost fallback only during explicit Vite development mode;
- call Backend endpoints through `fetch`;
- return fail-closed fallback data when requests fail;
- avoid exposing raw backend errors to UI components.

Relevant examples:

- `aiccApi.js`
- `marketProviderApi.js`
- `cognitionApi.js`
- `chartDataService.js`

### Existing Auth And Session Access Pattern

- `ProtectedRoute.jsx` checks Supabase session availability and operator authorization before rendering protected pages.
- It blocks unauthenticated or unapproved operators before `CommandCenter` renders.
- Group A frontend work should rely on this existing protected route posture and should not create a new auth architecture.

### Existing Test Framework

- `FrontendReact/package.json` defines `dev`, `build`, `lint`, and `preview`.
- No frontend test script or test framework was identified.
- Implementation tests should either use a separately approved test harness or start with lint/build plus pure module checks for DTO guards and mock fixtures.

### Existing Styling And Component Conventions

- Global page styling is under `FrontendReact/src/styles/`.
- `CommandCenter.css` contains command-section, grid, panel, card, status, and dashboard styling.
- Most AICC panels use existing card/panel classes rather than a separate CSS file per component.

## 4. Implemented Frontend File Set

### A. Files Created

#### `FrontendReact/src/services/GroupAReadApi.js`

- Purpose: frontend API client wrapper for Group A Backend endpoints.
- Responsibility: call endpoints, normalize HTTP statuses into safe UI states, and return redacted fail-closed results.
- Required: YES.
- Risk level: low.
- Rollback impact: remove the file and imports from Group A components.

#### `FrontendReact/src/services/GroupAReadContracts.js`

- Purpose: DTO type guards, safe-state constants, redacted error helpers, and forbidden-field checks.
- Responsibility: validate Provider Health, Market Context Digest, list responses, fail-closed responses, and malformed responses.
- Required: YES.
- Risk level: low.
- Rollback impact: remove the file and dependent imports.

#### `FrontendReact/src/components/GroupAStatusPanel.jsx`

- Purpose: operator-facing container for Group A cards in the AICC Command Center.
- Responsibility: coordinate Provider Health and Market Context Digest cards without decision or execution behavior.
- Required: YES if Group A appears in `CommandCenter`.
- Risk level: medium because it becomes part of the main dashboard layout.
- Rollback impact: remove the `CommandCenter.jsx` import and panel render.

#### `FrontendReact/src/components/ProviderHealthCard.jsx`

- Purpose: display safe provider/system health DTOs.
- Responsibility: render provider state, freshness, warnings, confidence, and fail-closed messages.
- Required: YES.
- Risk level: low.
- Rollback impact: remove from `GroupAStatusPanel`.

#### `FrontendReact/src/components/MarketContextDigestCard.jsx`

- Purpose: display latest safe market context digest state.
- Responsibility: render digest summary when available and fail-closed unavailable/stale states when not available.
- Required: YES.
- Risk level: medium because digest wording must not imply trading signal or autonomous recommendation.
- Rollback impact: remove from `GroupAStatusPanel`.

#### `FrontendReact/src/components/DigestDetailDrawer.jsx`

- Purpose: optional on-demand detail drawer for approved digest metadata.
- Responsibility: render DTO metadata only; no raw source material.
- Required: optional.
- Risk level: medium.
- Rollback impact: remove drawer import and trigger from `MarketContextDigestCard`.

#### `FrontendReact/src/services/__mocks__/GroupAReadFixtures.js`

- Purpose: static mock fixtures for loading, fresh, delayed, stale, unavailable, unknown, unauthorized, rate-limited, malformed, and redacted-error states.
- Responsibility: support future component/service tests without live Backend or provider calls.
- Required: YES if tests are implemented.
- Risk level: low.
- Rollback impact: remove fixture imports.

#### `FrontendReact/src/services/GroupAReadContracts.test.js`

- Purpose: future pure-module tests for DTO guard and redaction behavior.
- Responsibility: validate secret-like field rejection, raw payload rejection, hidden reasoning rejection, and learning/autonomy field rejection.
- Required: optional until a test harness is approved.
- Risk level: low.
- Rollback impact: remove test file.

#### `FrontendReact/src/components/ProviderHealthCard.test.jsx`

- Purpose: future component tests for provider health states.
- Responsibility: validate loading, fresh, delayed, stale, unavailable, unauthorized, rate-limited, and redacted error rendering.
- Required: optional until a test harness is approved.
- Risk level: low.
- Rollback impact: remove test file.

#### `FrontendReact/src/components/MarketContextDigestCard.test.jsx`

- Purpose: future component tests for digest states.
- Responsibility: validate unavailable, stale, delayed, malformed, and safe summary rendering.
- Required: optional until a test harness is approved.
- Risk level: low.
- Rollback impact: remove test file.

### B. Files Changed

#### `FrontendReact/src/pages/CommandCenter.jsx`

- Purpose: integrate `GroupAStatusPanel` into the existing AICC Command Center.
- Expected responsibility: import and render the panel in an existing status/system intelligence area.
- Required: YES for Command Center visibility.
- Risk level: medium due to high-traffic dashboard surface.
- Rollback impact: remove import and JSX insertion.

#### `FrontendReact/src/styles/CommandCenter.css`

- Purpose: add restrained styles for Group A status panel/cards using existing command-section, grid, panel, and card conventions.
- Expected responsibility: layout only; no behavior.
- Required: YES unless existing classes are sufficient.
- Risk level: low.
- Rollback impact: remove Group A CSS block.

The frontend implementation did not require Supabase schema changes, SQL migrations, provider expansion, or deployment actions.

## 5. Target AICC Components And Panels

Intended UI placement:

- `ProviderHealthCard`: AICC Command Center status rail or system intelligence panel.
- `MarketContextDigestCard`: AICC Command Center system intelligence panel or near existing strategic context sections.
- `DigestDetailDrawer`: optional detail view opened from the digest card.
- `GroupAStatusPanel`: wrapper panel inside `CommandCenter.jsx`.

Explicit exclusions:

- no trade execution placement;
- no autonomous action placement;
- no training or learning controls;
- no signal-generation UI;
- no decision-engine changes.

## 6. API Client Wrapper Design

### `fetchProviderHealth()`

- Endpoint: `GET /api/provider-health`
- Method: `GET`
- Auth assumption: protected route has established operator context; Backend enforces session/operator guard.
- Expected safe states: fresh, delayed, stale, unavailable, unknown, unauthorized, rate_limited, error_redacted.
- Error handling: return a redacted fail-closed frontend state.
- Rate-limit handling: map `429` to `rate_limited` and back off.
- Retry recommendation: conservative polling or manual refresh only.
- Browser persistence: none unless separately approved.

### `fetchProviderHealthByProvider(provider)`

- Endpoint: `GET /api/provider-health/:provider`
- Method: `GET`
- Auth assumption: same protected operator context.
- Expected safe states: fresh, delayed, stale, unavailable, unknown, unauthorized, rate_limited, error_redacted.
- Error handling: invalid or missing provider maps to redacted unavailable state.
- Rate-limit handling: map `429` to `rate_limited`.
- Retry recommendation: manual or low-frequency refresh.
- Browser persistence: none unless separately approved.

### `fetchMarketContextDigests(params)`

- Endpoint: `GET /api/market-context/digests`
- Method: `GET`
- Auth assumption: protected operator context.
- Expected safe states: unavailable by default until approved normalized digest persistence exists.
- Error handling: fail closed without local summary synthesis.
- Rate-limit handling: map `429` to `rate_limited`.
- Retry recommendation: manual fetch with future pagination.
- Browser persistence: none unless separately approved.

### `fetchLatestMarketContextDigest()`

- Endpoint: `GET /api/market-context/digests/latest`
- Method: `GET`
- Auth assumption: protected operator context.
- Expected safe states: unavailable/stale until approved normalized digest persistence exists.
- Error handling: show safe unavailable card; do not infer signal.
- Rate-limit handling: map `429` to `rate_limited`.
- Retry recommendation: manual or conservative polling.
- Browser persistence: none unless separately approved.

### `fetchMarketContextDigestById(id)`

- Endpoint: `GET /api/market-context/digests/:id`
- Method: `GET`
- Auth assumption: protected operator context.
- Expected safe states: unavailable, invalid request, unknown, unauthorized, rate_limited, error_redacted.
- Error handling: invalid IDs map to safe invalid/unavailable UI state.
- Rate-limit handling: map `429` to `rate_limited`.
- Retry recommendation: on-demand only.
- Browser persistence: none unless separately approved.

## 7. DTO Validation And Type-Guard Strategy

Create pure type guards in `GroupAReadContracts.js` for:

- Provider Health DTO
- Provider Health detail DTO
- Market Context Digest DTO
- Market Context Digest list DTO
- fail-closed/unavailable DTO
- redacted error DTO

Validation rules:

- reject raw payload fields;
- reject secret-like fields;
- reject hidden reasoning fields;
- reject training or autonomy activation fields;
- treat malformed DTO as `error_redacted`;
- never convert stale or unavailable state into bullish or bearish signal;
- require confidence values to stay within `0` to `1`;
- require recognized freshness states: `fresh`, `delayed`, `stale`, `unavailable`, `unknown`;
- require timestamps to be parseable before rendering as time.

## 8. UI State Handling

| State | User-facing label | Safe copy | Severity | Allowed action | Refresh behavior | Visibility |
| --- | --- | --- | --- | --- | --- | --- |
| `loading` | Loading | Checking approved Backend read service. | neutral | None beyond waiting. | continue current request | visible skeleton/card |
| `available/fresh` | Current | Approved read-service data is current. | normal | read-only inspect | normal interval or manual | visible |
| `delayed` | Delayed | Approved data is delayed. | caution | read-only inspect | slower polling or manual | visible with warning |
| `stale` | Stale | Data is too old for current operational confidence. | warning | read-only inspect only | manual refresh | visible with warning |
| `unavailable` | Unavailable | Approved source is missing or not ready. | warning | no derived action | manual refresh | visible fail-closed card |
| `unknown` | Unknown | Freshness cannot be determined safely. | caution | no derived action | manual refresh | visible with caution |
| `unauthorized / 401` | Sign in required | Operator session is missing or invalid. | blocked | re-authenticate only | stop polling | collapse data, show auth state |
| `rate_limited / 429` | Try again later | Request was limited. | caution | wait or manual retry later | back off | visible warning |
| `error_redacted` | Unable to load | Error details were redacted for safety. | warning | manual retry | manual refresh only | visible safe error |
| `malformed_response` | Response blocked | Response did not match the approved DTO contract. | warning | no data rendering | manual refresh only | visible fail-closed card |

## 9. Mock And Test Plan

Planned mock coverage:

- successful provider health
- provider unavailable
- latest digest unavailable
- stale digest
- delayed digest
- unknown status
- unauthorized `401`
- rate-limited `429`
- malformed DTO
- redacted error response
- secret-like value rejection
- raw payload rejection
- hidden reasoning field rejection
- training/autonomy field rejection

Recommended future frontend test files:

- `FrontendReact/src/services/GroupAReadContracts.test.js`
- `FrontendReact/src/components/ProviderHealthCard.test.jsx`
- `FrontendReact/src/components/MarketContextDigestCard.test.jsx`

Mocking strategy:

- use local static fixtures under `FrontendReact/src/services/__mocks__/GroupAReadFixtures.js`;
- mock frontend client responses rather than live Backend;
- do not call provider APIs;
- do not mutate Supabase;
- do not require production credentials.

Current limitation:

- no frontend test framework or `test` script exists in `FrontendReact/package.json`.
- owner approval is required before adding a test dependency or introducing a test harness.
- if no test harness is approved, implementation validation starts with `npm run lint`, `npm run build`, and pure module import checks.

## 10. Security And Privacy Controls

- no secrets in FrontendReact;
- no privileged database role in FrontendReact;
- no provider credentials in FrontendReact;
- no raw provider payload display;
- no stack trace display;
- no `localStorage` or `sessionStorage` persistence unless separately approved;
- no unauthenticated public display;
- no hidden reasoning display;
- no training or autonomy display;
- no execution controls.

## 11. Rollback Plan

If implementation is later approved and must be rolled back:

1. Revert the FrontendReact implementation commit.
2. Remove the `GroupAStatusPanel` import and JSX insertion from `CommandCenter.jsx`.
3. Remove Group A component, service, mock, and style files.
4. Retain Backend Group A endpoints unless a separate Backend rollback is approved.
5. Retain AI-DATASET certification records.
6. No database rollback is required because no Supabase changes are planned.

## 12. Implementation Sequence

Recorded implementation sequence:

1. Create DTO types/type guards.
2. Create API client wrappers.
3. Create redacted error handler.
4. Create mock fixtures.
5. Create `ProviderHealthCard`.
6. Create `MarketContextDigestCard`.
7. Create optional `DigestDetailDrawer`.
8. Integrate into the existing AICC Command Center panel structure.
9. Run frontend lint/build and any approved frontend tests.
10. Owner review before push.

## 13. Non-Goals

- no Backend changes;
- no Supabase changes;
- no SQL migrations;
- no provider expansion;
- no new external API calls;
- no trading execution;
- no autonomous execution;
- no AI learning/training;
- no AICC architecture redesign;
- no raw payload display;
- no public unauthenticated view.

## 14. Review Gate

The original implementation gate was satisfied by the subsequent committed Group A frontend work. Further behavioral changes still require owner review:

OWNER REVIEW - GROUP A FRONTENDREACT REMEDIATION

## 15. Explicit Locks

- AICC architecture unchanged.
- Frontend implementation read-only.
- Training OFF.
- Shadow Trainer OFF.
- Brain Learning OFF.
- Controlled Learning OFF.
- Autonomous Learning OFF.
