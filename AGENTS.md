<!-- CMI_SYSTEMS_HIERARCHY_START -->
# CMI-Systems, LLC Agent Hierarchy

```text
CMI-Systems, LLC
|
+-- AI-DATABASE / AI-DATASET
|   |-- Project root: C:\Users\Jesus Rebollar\OneDrive\Documents\CMI-Systems LLC\Development\Infrastructure\Core AI Development\AI DATASET
|   |-- Owns: database infrastructure, Supabase migrations, governance, certification, security, replay persistence, dataset persistence, training archive, migration management
|   |-- Branches:
|   |   |-- main = stable protected baseline
|   |   |-- devo = AI-DATASET development
|   |   |-- market-ai-staging = staging projects and migration validation
|   |   +-- market-ai-core = protected core architecture branch
|   +-- Boundary: stays inside the AI-DATASET project root/repo
|
+-- Market AI / AICC
    |-- Project root: C:\Users\Jesus Rebollar\Market-AI
    |-- Owns: FrontendReact application, AICC operator intelligence UI, app services, frontend/backend consumer integration
    |-- Branches:
    |   |-- origin/main = Market AI stable remote baseline
    |   |-- main = local stable branch when checked out from origin/main
    |   |-- market-ai-staging = Market AI staging integration branch when explicitly requested
    |   +-- market-ai-core = protected Market AI core architecture branch
    +-- Boundary: stays inside the Market AI project root/repo
```

AI-DATASET and Market AI/AICC are separate repositories. They should interact only through approved staging integration and migration gates, and only when staging/migration work is ready to be promoted toward production. Do not move database ownership into Market AI, and do not move application ownership into AI-DATASET.

Canonical branch spelling is `market-ai-staging`. If an instruction or note says `market-ai-stagiing`, treat it as a spelling mismatch and verify before checkout, commit, push, or migration work.
<!-- CMI_SYSTEMS_HIERARCHY_END -->
<!-- CHAT_CODEX_BASELINE_START -->
# Mandatory Chat-Codex Baseline

Before doing any work in this repository, every ChatGPT, Codex, Claude Code, or other coding-agent session must read the persistent project baseline:

1. `Chat-Codex/AGENTS.md`
2. `Chat-Codex/docs/AI_DATABASE_BRAIN_LAYER_ARCHITECTURE_v1.md`
3. `Chat-Codex/docs/STAGING_SECURITY_HARDENING_v1_FINAL_CERTIFICATION.md`
4. `Chat-Codex/docs/AICC_FRONTENDREACT_INTELLIGENCE_MAP.md`
5. `Chat-Codex/docs/AICC_CURRENT_STATUS.md`
6. `Chat-Codex/docs/AICC_SYSTEM_ARCHITECTURE_v1.md`
7. `Chat-Codex/docs/AICC_MEMORY_GOVERNANCE_v1.md`

Treat `Chat-Codex/` as canonical onboarding memory for this repository. Do not rely on chat history when the local documentation is available.

Hard safety defaults from the baseline:

- Production remains untouched unless explicitly authorized.
- Training remains OFF unless explicitly authorized.
- Shadow Trainer remains OFF unless explicitly authorized.
- Brain Learning remains OFF unless explicitly authorized.
- Do not apply Supabase migrations or mutate databases without explicit approval.
- Do not expose secrets.

If any instruction in this root `AGENTS.md` conflicts with `Chat-Codex/AGENTS.md`, stop and ask for clarification unless the user has given an explicit newer instruction.
<!-- CHAT_CODEX_BASELINE_END -->
# AGENTS.md

## Project Philosophy
- Build Market AI as a focused market-intelligence product: clear signals, explainable outputs, and reliable data flow over feature sprawl.
- Prefer incremental improvements that preserve working behavior and keep the frontend and backend easy to reason about.
- Treat market outputs as decision support, not guarantees or financial advice.

## Architecture Rules
- Preserve the current split: `Frontend/` owns presentation, browser state, chart rendering, and API consumption; `Backend/` owns provider access, secrets, normalization, and server routes.
- Keep provider credentials and privileged market-data calls on the backend only.
- Keep indicators, scoring, and summaries modular and testable; separate data retrieval from interpretation where practical.
- Extend existing modules and route patterns before introducing new layers, frameworks, or shared abstractions.

## Coding Standards
- Match the existing JavaScript style and module system in the touched area: browser ES modules in `Frontend/`, CommonJS in `Backend/`.
- Favor small functions, explicit names, structured data, and graceful failure paths for provider and network errors.
- Validate and normalize external data at boundaries before using it in charts, signals, summaries, or UI rendering.
- Keep comments brief and useful; add focused verification for logic that changes signals, scoring, provider behavior, or route contracts.

## Provider Strategy
- Treat Alpaca as the current market-data provider behind backend helpers and API routes.
- Do not leak provider-specific credentials, headers, or response shapes into frontend code.
- Add new providers through backend adapters or helpers with normalized outputs so provider changes do not ripple through the UI.
- Prefer explicit fallbacks, timeouts, rate-limit awareness, and observable errors over silent provider substitution.

## Intelligence Philosophy
- Keep intelligence explainable: indicators, anomaly scores, summaries, and classifications should be traceable to input data and rules.
- Distinguish live data, derived metrics, heuristics, and generated narrative in code and UI behavior.
- Prefer evidence aggregation and confidence-aware language over overstated predictions.
- Preserve human reviewability for any logic that could influence trading decisions.

## Restrictions
- Do not expose secrets, `.env` values, API keys, or provider credentials to the frontend, logs, fixtures, or documentation.
- Do not add trade execution, autonomous order placement, or financial-advice claims unless explicitly requested and designed with safeguards.
- Do not replace the stack, add heavy dependencies, or introduce broad rewrites for narrow tasks.
- Do not edit vendored dependencies such as `node_modules/` unless the user explicitly asks.

## Scalability Requirements
- Design routes and data helpers so watchlists, symbols, intervals, and providers can grow without duplicating logic.
- Keep network calls bounded and failure-tolerant; avoid unnecessary polling, fan-out, and repeated provider work.
- Prefer normalized contracts between backend and frontend so caching, batching, persistence, and background jobs can be added later.
- Keep performance-sensitive chart and refresh behavior responsive as data volume increases.

## No-Restructure Policy
- Do not rename, relocate, reorganize, or split major folders and files unless the user explicitly requests a restructure.
- Avoid opportunistic refactors while implementing features or fixes; change only the scope needed for the task.
- If a structural change appears necessary, explain the reason, expected impact, and smallest viable migration before proceeding.
