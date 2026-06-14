# AICC Supabase Migration Drafts

These migrations are drafts only.

Do not run these files against production Supabase yet. Phase N.2 is schema
planning only and does not activate live application persistence.

Live application persistence requires later approval in a separate phase.

Current status:

- Persistence remains OFF.
- Training remains OFF.
- Shadow Trainer remains OFF.
- No journal, replay, dataset, or certification records are written by this draft.
- No service role keys or secrets belong in this directory.

Draft files in this directory are intended to document future table structure,
owner-scoped RLS policies, and persistence order before any live database change.
