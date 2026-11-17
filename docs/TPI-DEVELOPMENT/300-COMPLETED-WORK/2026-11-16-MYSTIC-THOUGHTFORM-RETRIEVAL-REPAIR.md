# Mystic Thoughtform Retrieval Repair

**Date:** 2026-11-16 19:08 EST  
**Scope:** Public Mystic, public terminology reference, Cloudflare AI Search  
**Status:** Implementation complete; guarded release verification in progress.

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

Release and live verification will be recorded here after the maintained
sequence completes:

```text
npm run verify:local-auth-lifecycle
npm run release:preflight
TPI_PRODUCTION_DEPLOY=approved npm run release:production
```

The live checks must include the exact questions “What is a thoughtform?”,
“What is a thought form?”, and “What is a tulpa?” plus a repeat of the first
question to confirm stable routing and six public references.
