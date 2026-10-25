# TPI Development Standard — Agent Independence and Documentation Continuity

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-25 11:49.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI DEVELOPMENT STANDARD
## AGENT INDEPENDENCE & DOCUMENTATION CONTINUITY

**Applies to:** All future development directives for The Paranormal Initiative and StudioFlow.

### PRIMARY RULE

Every development directive must be understandable and executable by a qualified development agent with no access to previous conversations, previous agents' private context, or undocumented assumptions.

The project's Markdown documentation is the authoritative source of development continuity.

### MANDATORY REQUIREMENTS

**1. Documentation-first development**

Before implementation, the agent must read the governing project instructions, relevant architecture documentation, current development status, applicable historical directives, and source-to-live workflow.

**2. Self-contained directives**

Every directive must identify:

- Project and feature.
- Current implemented behavior.
- Observed problem or requested enhancement.
- Required final behavior.
- Relevant source files and systems, when known.
- Technical constraints.
- Systems that must remain unchanged.
- Acceptance tests.
- Documentation requirements.
- Deployment and verification requirements.

**3. No dependency on conversation history**

Do not assume the implementing agent has seen an earlier directive, addendum, screenshot, chat, or completion report.

If earlier work is relevant, summarize the necessary technical requirements and identify the corresponding Markdown records.

**4. Preserve working functionality**

Inspect existing implementations before changing them.

Do not duplicate, replace, or rebuild functioning systems unnecessarily.

**5. Maintain authoritative current-state documentation**

After implementation, update the appropriate Markdown documentation to reflect what was actually changed and how the resulting system works.

Documentation must identify important components, data flows, persistence behavior, integration points, limitations, and verification procedures.

**6. Preserve development history**

Maintain dated completion records documenting WHO, WHAT, WHERE, WHEN, WHY, and HOW.

Do not erase or rewrite historical development records to conceal previous implementations or failures.

**7. Separate implementation from verification**

Distinguish:

- Requested.
- Implemented.
- Locally tested.
- Deployed.
- Live verified.
- Owner accepted.

Never report a requirement as owner accepted without explicit owner confirmation.

**8. Mandatory handoff readiness**

Before reporting completion, confirm that a different qualified agent could continue development using the updated Markdown documentation and repository alone.

If important implementation knowledge exists only in the implementing agent's conversation, the documentation is incomplete.

### FINAL STANDARD

**An agent must be able to enter the project, read the documentation, understand the current system, execute its assigned directive, verify its work, and leave accurate documentation for the next agent.**

No reliance on undocumented conversations.

No reliance on a particular development agent.

No loss of project knowledge between development sessions.

**END OF STANDARD**
