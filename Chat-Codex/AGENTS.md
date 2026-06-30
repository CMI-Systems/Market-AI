# AGENTS.md - Market AI Persistent Agent Baseline

This `Chat-Codex` folder is the persistent documentation baseline for future ChatGPT, Codex, Claude Code, and other coding-agent sessions. Documentation is part of the project infrastructure. Agents should start here instead of relying on conversational memory.

## Workspace

Root repository:

`C:\Users\Jesus Rebollar\Market AI`

Documentation baseline root:

`Chat-Codex/`

Maintain these baseline files:

- `AGENTS.md`
- `docs/AI_DATABASE_BRAIN_LAYER_ARCHITECTURE_v1.md`
- `docs/STAGING_SECURITY_HARDENING_v1_FINAL_CERTIFICATION.md`
- `docs/AICC_FRONTENDREACT_INTELLIGENCE_MAP.md`
- `docs/AICC_CURRENT_STATUS.md`
- `docs/AICC_SYSTEM_ARCHITECTURE_v1.md`
- `docs/AICC_MEMORY_GOVERNANCE_v1.md`

## Repository Purpose

Market AI is a real-time operator intelligence platform. It is not a traditional trading dashboard. The product surface is AICC, the Advanced Intelligence Command Center, which coordinates real-time market intelligence, behavioral review, failsafe validation, replay memory, journal workflows, and operator decision support.

FrontendReact is the active UI direction. The original Frontend is historical/reference material only.

AI-DATABASE owns database infrastructure, governance, certification, security, replay persistence, dataset persistence, training archive planning, and migration management. Market-AI consumes deployed AI-DATABASE infrastructure through APIs and services.

## CMI Systems Repository Hierarchy

```text
CMI-Systems, LLC
|
+-- AI-DATABASE / AI-DATASET
|   |-- Root: C:\Users\Jesus Rebollar\OneDrive\Documents\CMI-Systems LLC\Development\Infrastructure\Core AI Development\AI DATASET
|   |-- Branches: main, devo, market-ai-staging, market-ai-core
|   +-- Owns database, migrations, governance, certification, replay/dataset persistence, and training archive planning
|
+-- Market AI / AICC
    |-- Root: C:\Users\Jesus Rebollar\Market AI
    |-- Branches: main / origin/main, market-ai-staging, market-ai-core
    +-- Owns FrontendReact, AICC operator intelligence UI, and application integration
```

These repositories stay isolated by root and branch. They interact only through approved staging integration and migration gates when staging/migration work is ready to move toward production.

## Branch Policy

### AI-DATABASE / AI-DATASET

AI-DATABASE branch usage belongs inside the AI-DATASET project root/repo only:

- `main`: stable protected baseline.
- `devo`: AI-DATASET development.
- `market-ai-staging`: staging projects and migration validation.
- `market-ai-core`: protected core architecture branch.

Canonical spelling is `market-ai-staging`. If a prompt says `market-ai-stagiing`, verify the intended branch before any checkout, commit, push, or migration action.

### Market AI / AICC

Market AI branch usage belongs inside the Market AI project root/repo only:

- `origin/main`: Market AI stable remote baseline.
- `main`: local stable branch when checked out from `origin/main`.
- `market-ai-staging`: Market AI staging integration branch when explicitly requested.
- `market-ai-core`: protected Market AI core architecture branch.

### Cross-Repository Rule

AI-DATASET and Market AI/AICC do not share working trees, commits, or branch actions. The only intended interaction is through approved staging integration and migration gates when staging/migration work is ready to be promoted toward production.

Never merge automatically. Never commit unless explicitly instructed. Always run `git branch` and `git status` before editing.

## Safety Rules

Do not:

- Modify application logic unless explicitly asked.
- Modify React components unless explicitly asked.
- Modify backend services unless explicitly asked.
- Apply Supabase migrations unless explicitly approved.
- Touch production.
- Enable Training.
- Enable Shadow Trainer.
- Enable Brain Learning.
- Enable Controlled Learning.
- Enable Autonomous Learning.
- Expose, print, commit, or summarize secrets.
- Run destructive SQL or `supabase db reset`.
- Run `supabase db push` without explicit approval.

Learning systems remain OFF unless explicitly authorized.

## Supabase Baseline

Active staging project:

- Name: `market-ai-staging`
- Project ref: `ilogukxgdhqymgxpxejr`

Production remains untouched by default.

Before any database work, verify the target project, branch, command path, and approval scope. Prefer read-only inspection before write operations.

## Current Platform Modules

FrontendReact currently represents the active AICC platform surface:

- Command Center
- Global Scan
- Market Pulse
- Data Streams
- Market Intelligence
- Newsletter
- Intelligence Spotlight
- Replay Center
- Trading Journal
- Settings
- Tactical Brain
- Behavioral Brain
- Failsafe Brain

## Agent Responsibilities

Future agents should:

1. Read this file first.
2. Read the architecture documents before coding.
3. Prefer documentation updates before schema changes.
4. Never assume chat history.
5. Verify staging project identity before database work.
6. Respect branch policy.
7. Treat documentation as canonical project memory.
8. Preserve historical decisions and mark superseded information instead of deleting it where practical.
9. Run validation after documentation updates: `git status`, `git diff --stat`, `git diff --check`.

## Current Known Status

- FrontendReact is the active intelligence application.
- AI-DATABASE staging hardening is documented as completed and certified in this baseline.
- Draft Brain Layer Migration 011 exists for review only.
- Migration 011 has not been approved for application from this Market AI baseline.
- Production remains untouched.
- Training, Shadow Trainer, Brain Learning, Controlled Learning, and Autonomous Learning remain OFF.
