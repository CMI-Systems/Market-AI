# Group A Frontend Test Harness Plan

## 1. Planning Status

PLANNING ONLY - test harness implementation is not approved yet.

This document plans a safe frontend test harness for the Group A Command Center panel. It does not add test code, modify FrontendReact source, modify Backend, mutate Supabase, create migrations, call providers, deploy, alter AICC architecture, or activate learning/training/autonomy.

## 2. Purpose

The test harness should validate Group A FrontendReact behavior without requiring real Supabase auth, a real backend runtime, provider APIs, production secrets, or deployment. It should make Group A UI behavior testable in isolation while preserving the existing AICC architecture and protected Command Center flow.

## 3. Current Blocker

- Local Vite runtime starts successfully.
- `/command-center` redirects to `/login` without local Supabase auth/env configuration.
- `.env` was not opened or created.
- Full live Command Center layout could not be visually inspected without secrets or operator auth.
- Source/static review passed.
- `npm run build` passed.
- Scoped Group A lint passed.

## 4. Test Harness Goals

- Validate `GroupAStatusPanel` rendering.
- Validate `ProviderHealthCard` rendering.
- Validate `MarketContextDigestCard` rendering.
- Validate fail-closed states.
- Validate unauthorized and `401` state handling.
- Validate rate-limited and `429` state handling.
- Validate malformed response state.
- Validate redacted error state.
- Validate unsafe DTO rejection behavior.
- Validate that execution, trading, autonomy, and training controls do not appear.
- Validate that raw payload, stack trace, and hidden reasoning text are not displayed.

## 5. Proposed Test Approach

Current tooling review:

- FrontendReact is a Vite React app.
- `FrontendReact/package.json` currently has `dev`, `build`, `lint`, and `preview` scripts.
- No existing `test` script was identified.
- No existing Vitest, Jest, Testing Library, Playwright, or Storybook test harness was identified.
- `FrontendReact/vite.config.js` uses a simple Vite React plugin config.

Recommended future approach:

- Use Vitest plus React Testing Library if owner approves adding test dependencies.
- Keep tests component-level and service-level, with mocked fetch responses and local fixtures.
- Avoid real Supabase auth, live Backend, provider APIs, deployment services, and production configuration.
- Add a dedicated `test:group-a` script if owner wants Group A checks to run separately from future full frontend tests.

Fallback approach if dependencies are not approved:

- Use a minimal Node-based pure module check for DTO guards only.
- Keep component visual validation manual/static until a proper React test harness is approved.

Storybook-style isolated visual harness:

- Possible later, but not recommended as the first step because it introduces more tooling and visual surface area.
- Requires separate owner approval.

## 6. Proposed Files To Create Or Change Later

### `FrontendReact/src/components/__tests__/GroupAStatusPanel.test.jsx`

- Purpose: render the full Group A panel with mocked API responses.
- Required: YES for panel-level coverage.
- Risk level: low.
- Rollback impact: remove the test file.

### `FrontendReact/src/components/__tests__/ProviderHealthCard.test.jsx`

- Purpose: validate provider health card states and read-only rendering.
- Required: YES.
- Risk level: low.
- Rollback impact: remove the test file.

### `FrontendReact/src/components/__tests__/MarketContextDigestCard.test.jsx`

- Purpose: validate digest card states, fail-closed copy, and safe summary rendering.
- Required: YES.
- Risk level: low.
- Rollback impact: remove the test file.

### `FrontendReact/src/services/__tests__/groupAReadContracts.test.js`

- Purpose: validate DTO guards, redaction decisions, unsafe field rejection, and fail-closed normalizers.
- Required: YES.
- Risk level: low.
- Rollback impact: remove the test file.

### `FrontendReact/src/services/__tests__/groupAReadApi.test.js`

- Purpose: validate approved endpoint calls, status mapping, malformed response handling, and no browser persistence.
- Required: YES if fetch wrapper behavior is included in harness scope.
- Risk level: low.
- Rollback impact: remove the test file.

### `FrontendReact/src/test/groupATestUtils.js`

- Purpose: shared render helpers, fetch mocks, and safe assertion helpers for Group A tests.
- Required: optional.
- Risk level: low.
- Rollback impact: remove the helper and imports.

### `FrontendReact/src/test/mockAuthContext.js`

- Purpose: test-only mock for protected context if a future route-level harness needs to render Command Center without real Supabase auth.
- Required: optional.
- Risk level: medium because it must stay test-only and must not become a runtime auth bypass.
- Rollback impact: remove the helper and route-level tests that import it.

### `FrontendReact/vitest.config.js`

- Purpose: Vitest configuration if the existing Vite config is not sufficient for component tests.
- Required: optional and only after owner approval.
- Risk level: medium because it changes project tooling.
- Rollback impact: remove config and package script references.

### `FrontendReact/src/setupTests.js`

- Purpose: install test environment helpers if Testing Library requires setup.
- Required: optional and only after owner approval.
- Risk level: low.
- Rollback impact: remove setup file and config reference.

### `FrontendReact/package.json` and lockfile

- Purpose: future test dependency and script updates if owner approves Vitest and Testing Library.
- Required: YES only if dependency-based harness is approved.
- Risk level: medium.
- Rollback impact: revert dependency and script changes.

## 7. Mocking Strategy

Use existing fixtures:

- `FrontendReact/src/services/__mocks__/groupAReadFixtures.js`

Planned mock states:

- fresh provider health
- delayed provider health
- stale provider health
- unavailable provider health
- unknown provider health
- latest digest unavailable
- stale digest
- delayed digest
- unauthorized `401`
- rate-limited `429`
- malformed DTO
- redacted error
- secret-like field rejection
- raw payload rejection
- hidden reasoning rejection
- training/autonomy field rejection

Mocks must remain local, deterministic, and free of real credentials or provider responses.

## 8. Auth Bypass Strategy For Tests Only

The harness must not use real Supabase credentials.

Rules:

- Do not open `.env`.
- Do not create real operator sessions.
- Do not create or modify production auth settings.
- Mock auth/session context only inside tests if route-level rendering is approved.
- Do not alter production auth flow.
- Do not alter Command Center architecture.
- Do not add runtime auth bypass.

Preferred first phase:

- Test `GroupAStatusPanel`, cards, services, and DTO guards directly without rendering `ProtectedRoute`.

Optional later phase:

- Add route-level Command Center tests with a test-only auth context mock if owner approves that scope.

## 9. Test Assertions

The harness should assert:

- components render safe labels;
- fail-closed states remain visible;
- unavailable and stale states do not become bullish or bearish signals;
- no execution buttons appear;
- no trading buttons appear;
- no autonomous controls appear;
- no training or learning controls appear;
- no hidden reasoning copy appears;
- no raw payload text appears;
- no stack traces appear;
- no secret-like values appear;
- refresh controls, when present, are conservative and read-only.

## 10. API Wrapper Tests

Planned API wrapper tests:

- successful approved endpoint fetch;
- `401` maps to unauthorized;
- `429` maps to rate-limited;
- non-JSON or malformed response maps to redacted error or malformed response;
- raw Error object is not exposed;
- no `localStorage` or `sessionStorage` persistence occurs;
- no external provider URLs are used.

Fetch must be mocked locally. Tests must not call a live Backend or provider endpoint.

## 11. DTO Guard Tests

Planned DTO guard tests:

- valid ProviderHealth DTO is accepted;
- valid MarketContextDigest DTO is accepted;
- fail-closed unavailable DTO is accepted;
- unsafe DTO fields are rejected or sanitized;
- malformed DTO is rejected;
- hidden reasoning, training, autonomy, and raw payload fields are rejected.

## 12. Validation Commands After Future Implementation

Recommended validation commands after an approved harness implementation:

- `npm run build`
- `npm run lint`
- `npm test` if a test script is added
- `npm run test:group-a` if a dedicated Group A script is added
- `git diff --check`
- secret-like pattern scan on changed files

Known current state:

- Full-project lint currently has unrelated pre-existing debt.
- Scoped Group A lint passed during manual-safe review.
- No `npm test` script currently exists.

## 13. Non-Goals

- No Backend changes.
- No Supabase changes.
- No SQL migrations.
- No real Supabase auth.
- No production auth bypass.
- No provider API calls.
- No Vercel, Render, or Resend usage.
- No deployment.
- No AICC architecture change.
- No training/learning/autonomy activation.

## 14. Approval Gate

Implementation must not begin until owner explicitly approves:

OWNER APPROVAL - GROUP A FRONTEND TEST HARNESS IMPLEMENTATION

Approval should specify whether dependency additions are allowed and whether the first harness phase includes component/service tests only or route-level Command Center tests with test-only auth mocks.

## 15. Explicit Locks

- AICC architecture unchanged.
- Training OFF.
- Shadow Trainer OFF.
- Brain Learning OFF.
- Controlled Learning OFF.
- Autonomous Learning OFF.
