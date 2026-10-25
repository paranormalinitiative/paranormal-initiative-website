# TPI-OPS-036 — Git Branch and Worktree Investigation

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 11:33.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI-OPS-036
## GITHUB BRANCH AND WORKTREE INVESTIGATION

**PRIORITY: HIGH**

Investigate the TPI website repository for unnecessary Git branches, worktrees, and duplicate development directories.

### 1. INSPECT

Run:

```bash
git worktree list --porcelain
git branch -a -vv
git status
git remote -v
```

Identify:

- Active repository and branch.
- All linked Git worktrees.
- Local and remote development branches.
- Stale or abandoned worktrees.
- Uncommitted changes.
- Any duplicate working directories used by coding agents.

### 2. DETERMINE WHAT IS SAFE TO REMOVE

Identify which worktrees or branches are obsolete.

Do not assume a worktree is obsolete merely because it has not been used recently.

Verify whether each contains unique commits, uncommitted changes, or references needed for restoration.

### 3. PROTECT ACTIVE DEVELOPMENT

Do not delete or alter:

- The active development branch.
- The production branch.
- The current Media Assets restoration work.
- Any unmerged changes.
- Existing studio data.
- Cloudflare deployments.

### 4. REPORT BEFORE DELETION

Provide:

1. Complete worktree inventory.
2. Complete branch inventory.
3. Which directories are active.
4. Which are obsolete.
5. Which can safely be removed.
6. Which repository and branch FreeBuff should use going forward.

**Do not delete anything until the owner approves the removal list.**

### 5. STANDARDIZE THE WORKSPACE

Recommend one authoritative working directory for future StudioFlow development.

The goal is to eliminate confusion between different copies of the website.

**END DIRECTIVE**
