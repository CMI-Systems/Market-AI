# AICC Phase P.1 - Route and Page Inventory

Date: 2026-06-15

Mode: AUDIT ONLY

Result: PASS

## Executive Summary

P.1 inventoried the current AICC operator-facing and system-facing frontend surfaces, major panels, route protection, navigation exposure, backend route dependencies, and product-surface gaps.

The app currently defines 20 frontend route paths in `FrontendReact/src/App.jsx`, backed by 19 page files and 16 component files. `/login` is public. All other defined frontend routes are wrapped in `ProtectedRoute` and redirected to `/login` when unauthenticated during smoke testing.

No feature should be treated as fully COMPLETE yet. Phase O certified raw-data controls conditionally for Alpaca REST capability boundaries, but P.1 found that operator workflows still require detailed audits for charts, signals, watchlists, replay, journal persistence, dataset repository/governance visibility, mobile behavior, authenticated page rendering, and real provider-connected workflows.

## Route Inventory

Smoke status reflects unauthenticated local Vite route checks. Protected routes were expected to redirect to `/login`.

| Route | Page Component | Public/Protected | Navigation Visibility | Auth Requirement | Smoke Result | Linked From Navigation | Orphan/Duplicate Notes | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/login` | `Login` | Public | Redirect target, no Command Center nav item | No session required | Renders | Auth flow only | Not orphaned | IMPLEMENTED_AUDIT_REQUIRED |
| `/` | `CommandCenter` | Protected | Command Center nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Primary Command Center route | IMPLEMENTED_AUDIT_REQUIRED |
| `/command-center` | `CommandCenter` | Protected | Not directly linked | Supabase session and beta operator check | Redirects to `/login` unauthenticated | No | Duplicate alias for `/`; useful but nav-orphaned | IMPLEMENTED_AUDIT_REQUIRED |
| `/system-boot` | `SystemBoot` | Protected | System Boot nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | None | IMPLEMENTED_AUDIT_REQUIRED |
| `/global-scan` | `GlobalScan` | Protected | Global Scan nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | None | IMPLEMENTED_AUDIT_REQUIRED |
| `/data-streams` | `DataStreams` | Protected | Data Streams nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Real streaming not certified | PARTIAL |
| `/newsletter` | `Newsletter` | Protected | Newsletter nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | No external news provider certified | PARTIAL |
| `/market-pulse` | `MarketPulse` | Protected | Market Pulse nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Derived cognition/raw-provider mix | IMPLEMENTED_AUDIT_REQUIRED |
| `/tactical-brain` | `TacticalBrain` | Protected | Tactical Brain nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Requires detailed brain audit | IMPLEMENTED_AUDIT_REQUIRED |
| `/behavioral-brain` | `BehavioralBrain` | Protected | Behavioral Brain nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Requires behavioral input audit | IMPLEMENTED_AUDIT_REQUIRED |
| `/failsafe-brain` | `FailsafeBrain` | Protected | Failsafe Brain nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Requires data-control audit continuation | IMPLEMENTED_AUDIT_REQUIRED |
| `/watchlists` | `Watchlists` | Protected | Watchlists nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Local symbol list plus provider data | PARTIAL |
| `/alerts` | `Alerts` | Protected | Alerts nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Uses AICC alert endpoint/unavailable fallback | PARTIAL |
| `/signals` | `Signals` | Protected | Signals nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Provider signal surface, no fallback candles | PARTIAL |
| `/replay-center` | `ReplayCenter` | Protected | Replay Center nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Uses sample trades and staging persistence services | PARTIAL |
| `/trading-journal` | `TradingJournal` | Protected | Trading Journal nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Journal persistence exists; replay bridge still placeholder-like | PARTIAL |
| `/archives` | `Archives` | Protected | Archives nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | AICC replay archive surface only | PARTIAL |
| `/profiles` | `Profiles` | Protected | Profiles nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Profile visibility exists; full user profile roadmap not certified | PARTIAL |
| `/subscriptions` | `Subscriptions` | Protected | Subscriptions nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Static closed-beta subscription page | SHELL_ONLY |
| `/settings` | `SystemSettings` | Protected | System Settings nav item | Supabase session and beta operator check | Redirects to `/login` unauthenticated | Yes | Diagnostics/settings visibility only | IMPLEMENTED_AUDIT_REQUIRED |

Route findings:

- No broken route was found during unauthenticated smoke testing.
- `/command-center` is a duplicate alias for `/` and is not linked from the main navigation.
- There is no catch-all route; unknown paths render no explicit 404 surface. This was not fixed in P.1.
- Authenticated route rendering was not validated in P.1 because smoke checks used unauthenticated protected-route behavior.

## Page Inventory

| Page File | Route(s) | Primary Purpose | Main Data Sources | Main Services Used | Backend Dependencies | Supabase Dependencies | Provider Dependencies | Auth | Current State | Placeholders / Limitations | Responsive Status | Audit Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `Login.jsx` | `/login` | Closed-beta login | Supabase Auth | `supabaseClient` | None | Auth session/sign-in | None | Public | IMPLEMENTED_AUDIT_REQUIRED | Needs staging auth workflow audit | Not validated | High |
| `CommandCenter.jsx` | `/`, `/command-center` | Main operational dashboard | Cognition APIs, provider quotes/candles/signals, AICC orchestrator | `cognitionApi`, `marketProviderApi`, `aiccIntelligenceOrchestrator` | `/api/cognition/*`, `/api/market/*` | Protected only | Alpaca REST via backend | Protected | IMPLEMENTED_AUDIT_REQUIRED | Many derived metrics; unsupported capabilities must remain labeled | Not validated | High |
| `SystemBoot.jsx` | `/system-boot` | Runtime/provider boot status | AICC status, provider diagnostics | `aiccApi`, `marketProviderApi` | `/api/aicc/system-status`, `/api/market/provider-status` | Protected only | Provider status | Protected | IMPLEMENTED_AUDIT_REQUIRED | Readiness score requires detailed audit | Not validated | High |
| `GlobalScan.jsx` | `/global-scan` | Broad market/cognition overview | Cognition APIs and provider diagnostics | `cognitionApi`, `marketProviderApi` | `/api/cognition/*`, `/api/market/*` | Protected only | Derived/provider diagnostics | Protected | IMPLEMENTED_AUDIT_REQUIRED | Global market data not certified as a real provider capability | Not validated | Medium |
| `DataStreams.jsx` | `/data-streams` | Stream/provider status surface | AICC status, provider diagnostics | `aiccApi`, `marketProviderApi` | `/api/aicc/system-status`, `/api/market/*` | Protected only | Provider status; no certified real stream | Protected | PARTIAL | Real provider streaming unsupported/uncertified | Not validated | High |
| `Newsletter.jsx` | `/newsletter` | Operator briefing/newsletter surface | Cognition overview and priority feed | `cognitionApi` | `/api/cognition/*` | Protected only | None certified for news | Protected | PARTIAL | News provider not implemented; briefing is cognition-derived | Not validated | Medium |
| `MarketPulse.jsx` | `/market-pulse` | Market heartbeat and liquidity/institutional context | Cognition APIs, provider diagnostics | `cognitionApi`, `marketProviderApi` | `/api/cognition/*`, `/api/market/*` | Protected only | Derived/provider diagnostics | Protected | IMPLEMENTED_AUDIT_REQUIRED | Market breadth/macro/global coverage not certified | Not validated | High |
| `TacticalBrain.jsx` | `/tactical-brain` | Tactical intelligence page | Provider quotes/candles/signals and tactical engine | `marketProviderApi`, `tacticalBrain` | `/api/market/*` | Protected only | Alpaca REST quotes/candles/signals | Protected | IMPLEMENTED_AUDIT_REQUIRED | Requires P.2/P.3 detailed chart/signal audit | Not validated | High |
| `BehavioralBrain.jsx` | `/behavioral-brain` | Behavioral market/operator assessment | Cognition overview, confidence, replay | `cognitionApi`, `aiccApi`, `behavioralBrain` | `/api/cognition/*`, `/api/aicc/replay` | Protected only | Indirect derived inputs | Protected | IMPLEMENTED_AUDIT_REQUIRED | Market behavior inputs may be unavailable; operator behavior separation needs audit | Not validated | High |
| `FailsafeBrain.jsx` | `/failsafe-brain` | Failsafe risk and data-integrity page | AICC system status, provider diagnostics, alerts | `aiccApi`, `marketProviderApi`, `failsafeBrain` | `/api/aicc/*`, `/api/market/*` | Protected only | Provider status/alerts | Protected | IMPLEMENTED_AUDIT_REQUIRED | Needs ongoing certification visibility audit | Not validated | High |
| `Watchlists.jsx` | `/watchlists` | Multi-symbol watchlist | LocalStorage symbols, provider quotes/signals | `marketDataService`, `marketProviderApi` | `/api/market/*` | Protected only | Alpaca REST quotes/signals via backend | Protected | PARTIAL | Static symbol metadata remains; no Supabase watchlist sync | Not validated | High |
| `Alerts.jsx` | `/alerts` | Alert feed/filtering | AICC alerts endpoint | `aiccApi` | `/api/aicc/alerts` | Protected only | Indirect provider/AICC alerts | Protected | PARTIAL | Alert framework exists; advanced alert system not certified | Not validated | Medium |
| `Signals.jsx` | `/signals` | Signal/charts page | Provider quote/candles/signals | `marketProviderApi`, `marketDataService` | `/api/market/*` | Protected only | Alpaca REST quote/candles/signals | Protected | PARTIAL | Chart rendering needs P.2 audit; no fallback simulation candles | Not validated | High |
| `ReplayCenter.jsx` | `/replay-center` | Replay, behavioral review, dataset snapshots | Sample trades, replay persistence, dataset repository/history/governance services | `replayPersistenceService`, dataset services, intelligence replay engines | Supabase only for persistence; no backend route required for local sample logic | `replay_sessions`, dataset tables if configured | None directly | Protected | PARTIAL | Uses `sampleTrades`; persistence depends on staging Supabase | Not validated | High |
| `TradingJournal.jsx` | `/trading-journal` | Journal capture and persistence | Operator form state, AICC replay, Supabase journal entries | `journalPersistenceService`, `aiccApi` | `/api/aicc/replay` | `journal_entries` if configured | None directly | Protected | PARTIAL | Replay handoff area still placeholder-like | Not validated | High |
| `Archives.jsx` | `/archives` | Replay/archive listing | AICC replay endpoint | `aiccApi` | `/api/aicc/replay` | Protected only | Indirect | Protected | PARTIAL | Archive persistence/search not certified | Not validated | Low |
| `Profiles.jsx` | `/profiles` | Operator profile/status visibility | Profile and provider/user services | `operatorProfileService`, backend profile-like APIs | `/api/v1/user/*` where used | Operator profile/auth context | None directly | Protected | PARTIAL | Full user profile roadmap not certified | Not validated | Medium |
| `Subscriptions.jsx` | `/subscriptions` | Subscription/beta plan page | Static page content | None | None | Protected only | None | Protected | SHELL_ONLY | No entitlement workflow connected | Not validated | Low |
| `SystemSettings.jsx` | `/settings` | Provider/system diagnostics settings | AICC status, provider diagnostics, Webull health | `aiccApi`, `marketProviderApi` | `/api/aicc/system-status`, `/api/market/*` | Protected only | Alpaca status, Webull not implemented | Protected | IMPLEMENTED_AUDIT_REQUIRED | Settings are visibility only; no production config mutation | Not validated | High |

## Major Component Inventory

| Component | Purpose | Used in Active UI | Data Sources | State |
| --- | --- | --- | --- | --- |
| `ProtectedRoute.jsx` | Auth and beta-gate wrapper | Yes | Supabase auth, operator profile service | IMPLEMENTED_AUDIT_REQUIRED |
| `GlobalScanPanel.jsx` | Command Center global scan panel | Yes | Cognition APIs | IMPLEMENTED_AUDIT_REQUIRED |
| `NewsLetterPanel.jsx` | Command Center newsletter panel | Yes | Cognition APIs | PARTIAL |
| `MarketPulsePanel.jsx` | Command Center pulse panel | Yes | Parent props from cognition data | IMPLEMENTED_AUDIT_REQUIRED |
| `DataStreamsPanel.jsx` | Command Center stream/provider panel | Yes | AICC status, provider status | PARTIAL |
| `InstitutionalAccumlationPanel.jsx` | Institutional flow panel | Yes | Parent props | PLACEHOLDER |
| `VolatilityCompressionPanel.jsx` | Liquidity/volatility panel | Yes | Parent props | PLACEHOLDER |
| `CrisisManagementPanel.jsx` | Crisis/risk panel | Yes | Parent props | PLACEHOLDER |
| `ExpansionPanel.jsx` | Strategic expansion panel | Yes | Parent props | PLACEHOLDER |
| `BehavioralBrainPanel.jsx` | Legacy/standalone brain panel | No | Props only | ORPHANED |
| `BrainActivationPanel.jsx` | Static brain activation card | No | Static | ORPHANED |
| `FailsafeBrainPanel.jsx` | Legacy/standalone failsafe panel | No | Props only | ORPHANED |
| `IntelligenceFeedPanel.jsx` | Priority feed panel with static fallback feed | No | Cognition API/static fallback | ORPHANED |
| `MarketOverviewPanel.jsx` | Static major index overview | No | Static hardcoded values | ORPHANED |
| `SystemBootPanel.jsx` | Standalone boot/provider panel | No | AICC/provider APIs | ORPHANED |
| `SystemOnlinePanel.jsx` | Static system-online card | No | Static | ORPHANED |
| `TacticalBrainPanel.jsx` | Legacy/standalone tactical panel | No | Props only | ORPHANED |

Note: The component directory contains one filename typo: `InstitutionalAccumlationPanel.jsx`. It is imported and used, so this is not a runtime break.

## Feature Surface Classification

| Feature Surface | Classification | Reason |
| --- | --- | --- |
| Command Center | IMPLEMENTED_AUDIT_REQUIRED | Primary dashboard renders and links major surfaces; requires detailed data/workflow audit. |
| System Boot | IMPLEMENTED_AUDIT_REQUIRED | Runtime/provider visibility exists; readiness scoring requires audit. |
| Global Scan | IMPLEMENTED_AUDIT_REQUIRED | Cognition surface exists; global-market provider coverage is not certified. |
| Market Pulse | IMPLEMENTED_AUDIT_REQUIRED | Derived pulse surface exists; breadth/macro limitations remain. |
| Tactical Brain | IMPLEMENTED_AUDIT_REQUIRED | Brain engine/page exists; signal/chart audit still pending. |
| Behavioral Brain | IMPLEMENTED_AUDIT_REQUIRED | Engine/page exists; market vs operator behavior inputs need audit. |
| Failsafe Brain | IMPLEMENTED_AUDIT_REQUIRED | Data-control surface exists; ongoing certification display audit needed. |
| System Settings | IMPLEMENTED_AUDIT_REQUIRED | Diagnostics surface exists; no config mutation in P.1. |
| Login/Auth | IMPLEMENTED_AUDIT_REQUIRED | Auth surfaces exist; staging auth workflow not validated in P.1. |
| Provider Status | IMPLEMENTED_AUDIT_REQUIRED | Backend/frontend status surfaces exist; provider claims need continued audit. |
| System Status Monitoring | IMPLEMENTED_AUDIT_REQUIRED | AICC status exists; production observability not validated. |
| Data Streams | PARTIAL | Stream status exists; real provider streaming is unsupported/uncertified. |
| Newsletter / Operator Briefing | PARTIAL | Briefing surface exists; news provider not implemented. |
| Watchlists | PARTIAL | Local watchlist and provider quote/signal integration exist; persistence/sync missing. |
| Signals | PARTIAL | Provider signal/chart surface exists; chart audit pending. |
| Alerts | PARTIAL | Alert endpoint and UI exist; advanced alert workflow not certified. |
| Replay Center | PARTIAL | Replay/dataset/governance visibility exists; sample trade dependency remains. |
| Replay Intelligence | PARTIAL | Intelligence engine exists; uses replay context and fallback mission/mistake defaults. |
| Behavioral Review | PARTIAL | Replay behavioral review services exist; full workflow not validated. |
| Mission Planning | PARTIAL | Replay/journal mission sections exist; not a complete workflow. |
| Trading Journal | PARTIAL | Journal persistence exists; replay integration remains limited. |
| Archives | PARTIAL | Archive page exists; archive persistence/search not complete. |
| Profiles | PARTIAL | Profile/status visibility exists; full user profile system not complete. |
| Dataset Repository | PARTIAL | Repository summary service and Replay Center snapshot exist; full repository page absent. |
| Operator History | PARTIAL | History service and Replay Center snapshot exist; full page absent. |
| Dataset Governance | PARTIAL | Governance service and snapshot exist; no mutation/approval workflow. |
| Charts | PARTIAL | Signal and Command Center chart surfaces exist; P.2 audit required. |
| Subscriptions | SHELL_ONLY | Static protected page only. |
| News Intelligence | PLACEHOLDER | No certified news provider path. |
| Institutional/Volatility/Crisis/Expansion panels | PLACEHOLDER | Summary panels depend on parent props and fallback copy. |

Counts:

- COMPLETE: 0
- IMPLEMENTED_AUDIT_REQUIRED: 11
- PARTIAL: 16
- SHELL_ONLY: 1
- PLACEHOLDER: 2 grouped surfaces
- BROKEN: 0
- ORPHANED: 8 component surfaces
- UNKNOWN: 0

## Operator Tool Inventory

| Tool | Exists | State | Data Source Classification |
| --- | --- | --- | --- |
| Trading Journal | Yes | PARTIAL | SUPABASE_PERSISTED_DATA, LOCAL_STATE, EXPLICIT_UNAVAILABLE_STATE |
| Replay Center | Yes | PARTIAL | LOCAL_STATE, STATIC_PLACEHOLDER, SUPABASE_PERSISTED_DATA |
| Replay Intelligence | Yes | PARTIAL | LOCAL_STATE, STATIC_PLACEHOLDER, DERIVED_FROM_RAW where provided |
| Behavioral Review | Yes | PARTIAL | LOCAL_STATE, DERIVED_FROM_RAW, STATIC_PLACEHOLDER |
| Mission Planning | Yes | PARTIAL | LOCAL_STATE, STATIC_PLACEHOLDER |
| Operator History | Yes, embedded | PARTIAL | SUPABASE_PERSISTED_DATA, EXPLICIT_UNAVAILABLE_STATE |
| Dataset Repository | Yes, embedded | PARTIAL | SUPABASE_PERSISTED_DATA, EXPLICIT_UNAVAILABLE_STATE |
| Charts | Yes | PARTIAL | RAW_PROVIDER_DATA, EXPLICIT_UNAVAILABLE_STATE |
| Watchlists | Yes | PARTIAL | RAW_PROVIDER_DATA, LOCAL_STATE, STATIC_PLACEHOLDER |
| Signals | Yes | PARTIAL | RAW_PROVIDER_DATA, DERIVED_FROM_RAW, EXPLICIT_UNAVAILABLE_STATE |
| Alerts | Yes | PARTIAL | DERIVED_FROM_RAW, EXPLICIT_UNAVAILABLE_STATE |
| News Intelligence | Partial surface only | PLACEHOLDER | DERIVED_FROM_RAW, STATIC_PLACEHOLDER |
| Newsletter / Operator Briefing | Yes | PARTIAL | DERIVED_FROM_RAW, EXPLICIT_UNAVAILABLE_STATE |
| Market Pulse | Yes | IMPLEMENTED_AUDIT_REQUIRED | DERIVED_FROM_RAW, EXPLICIT_UNAVAILABLE_STATE |
| Global Scan | Yes | IMPLEMENTED_AUDIT_REQUIRED | DERIVED_FROM_RAW, EXPLICIT_UNAVAILABLE_STATE |
| Data Streams | Yes | PARTIAL | PROVIDER STATUS, EXPLICIT_UNAVAILABLE_STATE |
| System Boot | Yes | IMPLEMENTED_AUDIT_REQUIRED | PROVIDER STATUS, EXPLICIT_UNAVAILABLE_STATE |
| System Settings | Yes | IMPLEMENTED_AUDIT_REQUIRED | PROVIDER STATUS, EXPLICIT_UNAVAILABLE_STATE |
| Provider Status | Yes | IMPLEMENTED_AUDIT_REQUIRED | RAW_PROVIDER_DATA metadata, EXPLICIT_UNAVAILABLE_STATE |
| System Status Monitoring | Yes | IMPLEMENTED_AUDIT_REQUIRED | Backend AICC status, EXPLICIT_UNAVAILABLE_STATE |

## Data Source Classification

| Surface | Data Source Types |
| --- | --- |
| Command Center | RAW_PROVIDER_DATA, DERIVED_FROM_RAW, EXPLICIT_UNAVAILABLE_STATE |
| Tactical Brain | RAW_PROVIDER_DATA, DERIVED_FROM_RAW, EXPLICIT_UNAVAILABLE_STATE |
| Behavioral Brain | DERIVED_FROM_RAW, LOCAL_STATE, EXPLICIT_UNAVAILABLE_STATE |
| Failsafe Brain | DERIVED_FROM_RAW, PROVIDER STATUS, EXPLICIT_UNAVAILABLE_STATE |
| Market Pulse | DERIVED_FROM_RAW, EXPLICIT_UNAVAILABLE_STATE |
| Global Scan | DERIVED_FROM_RAW, EXPLICIT_UNAVAILABLE_STATE |
| Signals | RAW_PROVIDER_DATA, DERIVED_FROM_RAW, EXPLICIT_UNAVAILABLE_STATE |
| Watchlists | RAW_PROVIDER_DATA, LOCAL_STATE, STATIC_PLACEHOLDER, EXPLICIT_UNAVAILABLE_STATE |
| Alerts | DERIVED_FROM_RAW, EXPLICIT_UNAVAILABLE_STATE |
| Newsletter | DERIVED_FROM_RAW, STATIC_PLACEHOLDER, EXPLICIT_UNAVAILABLE_STATE |
| Data Streams | PROVIDER STATUS, EXPLICIT_UNAVAILABLE_STATE |
| System Boot | PROVIDER STATUS, EXPLICIT_UNAVAILABLE_STATE |
| System Settings | PROVIDER STATUS, EXPLICIT_UNAVAILABLE_STATE |
| Replay Center | LOCAL_STATE, STATIC_PLACEHOLDER, SUPABASE_PERSISTED_DATA |
| Trading Journal | LOCAL_STATE, SUPABASE_PERSISTED_DATA, EXPLICIT_UNAVAILABLE_STATE |
| Archives | DERIVED_FROM_RAW, EXPLICIT_UNAVAILABLE_STATE |
| Profiles | LOCAL_STATE, SUPABASE AUTH, backend profile-style APIs |
| Subscriptions | STATIC_PLACEHOLDER |

No market-output feature was marked COMPLETE because each still requires detailed audit, authenticated workflow validation, or removal of placeholder/static dependence.

## Navigation Audit

Main navigation is implemented inside `CommandCenter.jsx`.

Navigation includes:

- Command Center
- System Boot
- Global Scan
- Data Streams
- Newsletter
- Market Pulse
- Tactical Brain
- Behavioral Brain
- Failsafe Brain
- Watchlists
- Alerts
- Signals
- Replay Center
- Trading Journal
- Archives
- Profiles
- Subscriptions
- System Settings

Navigation findings:

- All main navigation links point to defined routes.
- No dead main navigation links were found.
- `/command-center` is defined but not linked; `/` is the linked Command Center route.
- `/login` is intentionally not part of Command Center navigation.
- No separate mobile navigation component was found; mobile navigation parity was not validated in P.1.
- Protected routes remained protected during smoke testing.

Navigation Integrity: PASS

Protected Route Integrity: PASS

## Service Dependency Map

| Page / Surface | Frontend Services | Backend Routes | Provider | Supabase | Failure State |
| --- | --- | --- | --- | --- | --- |
| Login / ProtectedRoute | `supabaseClient`, `operatorProfileService` | None | None | Auth/session/profile | Redirect or auth setup message |
| Command Center | `cognitionApi`, `marketProviderApi`, `aiccIntelligenceOrchestrator` | `/api/cognition/*`, `/api/market/*` | Alpaca via backend | Protected only | Explicit unavailable/offline states |
| System Boot | `aiccApi`, `marketProviderApi` | `/api/aicc/system-status`, `/api/market/*` | Alpaca/Webull status only | Protected only | Explicit unavailable/provider-offline states |
| Global Scan | `cognitionApi`, `marketProviderApi` | `/api/cognition/*`, `/api/market/*` | Derived/provider diagnostics | Protected only | Loading/unavailable states |
| Data Streams | `aiccApi`, `marketProviderApi` | `/api/aicc/system-status`, `/api/market/provider-status` | Provider status only | Protected only | DATA_UNAVAILABLE |
| Newsletter | `cognitionApi` | `/api/cognition/*` | None certified for news | Protected only | Backend unavailable |
| Market Pulse | `cognitionApi`, `marketProviderApi` | `/api/cognition/*`, `/api/market/*` | Provider diagnostics | Protected only | Loading/unavailable states |
| Tactical Brain | `marketProviderApi`, tactical engines | `/api/market/*` | Alpaca REST | Protected only | INSufficient data/unavailable |
| Behavioral Brain | `cognitionApi`, `aiccApi`, behavioral engines | `/api/cognition/*`, `/api/aicc/replay` | Indirect | Protected only | Unavailable input notice |
| Failsafe Brain | `aiccApi`, `marketProviderApi`, failsafe engines | `/api/aicc/*`, `/api/market/*` | Provider diagnostics | Protected only | Data unavailable/failsafe notice |
| Watchlists | `marketDataService`, `marketProviderApi` | `/api/market/*` | Alpaca REST | LocalStorage only | Unavailable rows and `--` values |
| Signals | `marketProviderApi`, local market-data helpers | `/api/market/*` | Alpaca REST | Protected only | No fallback simulation candles |
| Alerts | `aiccApi` | `/api/aicc/alerts` | Indirect | Protected only | Unavailable alert fallback |
| Replay Center | Replay/dataset/history/governance services | None required for local sample; Supabase services direct | None direct | Replay/dataset tables if configured | Persistence unavailable messages |
| Trading Journal | `journalPersistenceService`, `aiccApi` | `/api/aicc/replay` | None direct | `journal_entries` if configured | Persistence unavailable messages |
| Archives | `aiccApi` | `/api/aicc/replay` | Indirect | Protected only | Empty archive |
| Profiles | `operatorProfileService`, user/provider helpers | `/api/v1/user/*` where used | None direct | Operator profile/auth context | Detecting/unavailable |
| Subscriptions | None | None | None | Protected only | Static shell |
| System Settings | `aiccApi`, `marketProviderApi` | `/api/aicc/system-status`, `/api/market/*` | Alpaca/Webull status only | Protected only | Explicit unavailable states |

## Product Surface Gaps

Gaps requiring later phases:

- Authenticated page rendering was not smoke-tested in P.1.
- Mobile/responsive validation was not performed.
- No explicit 404/catch-all route exists.
- `/command-center` is a valid alias but is not visible in navigation.
- Real provider streaming is not certified as implemented.
- Webull remains not implemented.
- News, options, macro, global-market, and market-breadth provider capabilities are unsupported/uncertified.
- Watchlists are localStorage-backed, not Supabase-synced.
- Replay Center still uses `sampleTrades`.
- Trading Journal contains replay handoff placeholder copy.
- Dataset Repository, Operator History, Historical Validation, and Dataset Governance are embedded snapshots, not full pages.
- Subscription and entitlement workflow is shell/static.
- Several component panels exist but are not routed or imported.
- README roadmap still references a Simulation Engine fallback, while Phase O now blocks runtime simulation in staging/production-like paths.

## Orphaned Features

Orphaned component candidates:

- `BehavioralBrainPanel.jsx`
- `BrainActivationPanel.jsx`
- `FailsafeBrainPanel.jsx`
- `IntelligenceFeedPanel.jsx`
- `MarketOverviewPanel.jsx`
- `SystemBootPanel.jsx`
- `SystemOnlinePanel.jsx`
- `TacticalBrainPanel.jsx`

Route-level orphan note:

- `/command-center` is a route alias for `CommandCenter` but is not linked in navigation. It is not broken.

## Missing Roadmap Features

Roadmap features listed or implied but not fully implemented/certified in code:

- Webull Provider Activation.
- Live Watchlist Synchronization.
- Portfolio Intelligence Layer.
- Mobile Optimization validation.

Roadmap Features Missing in Code: 4

## Code Features Missing in Roadmap

Code surfaces not clearly represented in the current README module list:

- `Profiles` route.
- `Subscriptions` route.
- `SystemSettings` route.
- `SystemBoot` route.
- Dataset Repository snapshot.
- Operator History and Dataset Governance snapshots.

Code Features Missing in Roadmap: 6

## Smoke-Test Results

Method:

- Local Vite dev server on `127.0.0.1:5174`.
- Headless Edge via Chrome DevTools Protocol.
- Routes tested: all 20 defined `App.jsx` routes.
- Auth state: unauthenticated.

Results:

- `/login` rendered.
- All 19 protected route paths redirected safely to `/login`.
- Root mounted for every route.
- No blank screens.
- No browser console/runtime errors.
- No visible `NaN`.
- No visible `undefined`.
- Dev server was not left running.

Smoke Test: PASS

## Build Result

Command:

`npm.cmd run build`

Working directory:

`FrontendReact`

Result:

PASS

Note:

Vite emitted the existing chunk-size warning. No build failure occurred.

## P.1 Result

Phase P.1 Route and Page Inventory: PASS

Routes Identified: 20

Pages Identified: 19

Major Components Identified: 16

Complete Features: 0

Implemented - Audit Required: 11

Partial Features: 16

Shell-Only Features: 1

Placeholder Features: 2

Broken Features: 0

Orphaned Features: 8

Unknown Features: 0

Roadmap Features Missing in Code: 4

Code Features Missing in Roadmap: 6

Navigation Integrity: PASS

Protected Route Integrity: PASS

Smoke Test: PASS

Build: PASS

Product Surface Readiness: READY_FOR_DETAILED_AUDITS

## Recommended P.2 Priority

Recommended Next Step: P.2 Charts Audit

P.2 should focus on:

- Chart source contracts.
- Quote/candle mapping into chart state.
- Empty, partial, stale, and unavailable chart states.
- Signal chart labels and confidence display.
- Command Center overview chart behavior.
- Mobile chart layout.
- Ensuring no placeholder chart values appear as live market data.

