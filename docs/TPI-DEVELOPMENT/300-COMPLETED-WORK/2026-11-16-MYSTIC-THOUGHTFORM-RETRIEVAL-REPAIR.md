# Mystic Thoughtform Retrieval Repair

**Date:** 2026-11-16 19:08 EST  
**Scope:** Public Mystic, public terminology reference, Cloudflare AI Search  
**Status:** DEPLOYED AND LIVE VERIFIED.

## What happened

The owner asked Mystic, “What is a thoughtform?” Mystic did not answer the
question consistently. One response sent the member to the glossary, and a
repeat question routed somewhere else. That is not acceptable for a term that
belongs in TPI’s public paranormal knowledge base.

## Root cause

The public terminology book did not have explicit entries for Thoughtform,
Thought Form, or Tulpa. Mystic’s public API also accepted generated text when
Cloudflare AI Search returned no usable public source chunks. An empty-source
answer could therefore sound helpful without being grounded in a retrieved TPI
page.

## Repair

- Added `Thoughtform / Thought Form` to
  `TPI_Terminology_Reference_Unified.html`.
- Added `Tulpa` as a related terminology entry with a context-sensitive
  definition.
- Added stable public Mystic aliases for `thoughtform`, `thought form`,
  `thoughtforms`, `tulpa`, and `tulpas`.
- Added a direct TPI answer that distinguishes a research/report term from a
  proven conclusion.
- Cross-referenced six public TPI references: Terminology, Field Encyclopedia,
  Investigation Compendium, Evidence Compendium, Forensic Analysis Compendium,
  and Ghostology 101.
- Tightened the API so an AI-generated answer without a usable public source is
  not returned as verified. The documented thoughtform/tulpa fallback is used
  only for those aliases; other unanswered questions retain the honest
  fallback.

## Knowledge and safety policy

Mystic must answer the question directly when the public context contains the
answer. It must not send a member to “look in the glossary” when the glossary
or the six-reference cross-check already provides the answer. Thoughtform and
tulpa remain contextual terms in paranormal and esoteric traditions. TPI does
not present them as proof that an independently existing entity has been
created. Internal Help Desk, Administration Center, moderator, staff, owner,
credential, and private-member material remains outside Mystic’s public
knowledge boundary.

## Protected regression

The Help Center separation verifier now checks that:

1. Thoughtform, Thought Form, and Tulpa are direct-answer aliases.
2. The answer uses six public TPI references.
3. The public API retains `max_num_results: 6`.
4. An empty AI Search source set cannot be returned as a verified answer.
5. The internal knowledge boundary remains unchanged.

## Verification

The maintained release sequence completed successfully:

```text
npm run verify:local-auth-lifecycle
npm run release:preflight
TPI_PRODUCTION_DEPLOY=approved npm run release:production
```

Results:

- Local authentication lifecycle: **38/38**.
- Help Center separation and Mystic protection contracts: **34/34**.
- Member boundary regression: **48/48**.
- Focused member/profile/feed browser acceptance: **57/57**.
- Targeted Messenger browser regression: **27/27**.
- Messenger MP4 and ZIP media round trip: **PASS**.
- Guarded release preflight: **READY**, exact candidate certified with **14
  gates**.
- Production anonymous smoke: **10/10**.
- Live production queries for “What is a thoughtform?”, “What is a thought
  form?”, “What is a tulpa?”, and a repeat thoughtform query: **4/4 direct,
  consistent answers**, each returning the six public TPI references.

Production release:

- Release: `rel-711a9fbd8d0d-e68627783f29`
- Worker version: `74c14f0d-7cfd-4570-9567-db467673bd2b`
- Source commit: `711a9fbd8d0d210d7b28aabc31d95261c4f67dfa`
- Traffic: **100% production**
- Rollback version: `90170296-2208-473f-9563-0007e7159ca6`

StudioFlow, Creator Studio, Nova Workspace, private media, and owner data
were not modified. The release used the shared-API profile and retained the
protected application byte guard.
