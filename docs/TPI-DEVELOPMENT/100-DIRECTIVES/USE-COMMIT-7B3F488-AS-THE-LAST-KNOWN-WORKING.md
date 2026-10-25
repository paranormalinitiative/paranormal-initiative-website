# Use commit `7b3f488` as the last known working reference.

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 11:28.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

Use commit `7b3f488` as the last known working reference.

Restore ONLY the Media Assets navigation interface to its appearance and functionality at that commit.

Do not reset the repository, revert the entire commit, or replace the complete StudioFlow application.

Preserve all shared backup, persistence, authentication, studio-switching, and other functionality outside Media Assets.

Remove the newer Media Assets overlays, injected bridge UI, and associated styling only where they affect Media Assets.

Preserve all existing studio data, uploaded media, and saved assignments.

If a shared dependency cannot be isolated without affecting another StudioFlow section, report that specific conflict before changing it.

Once restored, visually verify Media Assets, run the relevant tests, and complete the guarded commit, push, and production deployment.

Then STOP. No additional features or redesigns.
