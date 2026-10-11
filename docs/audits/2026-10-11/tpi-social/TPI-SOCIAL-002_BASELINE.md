# TPI-SOCIAL-002 Baseline

Baseline recorded 2026-10-11 before the TPI-SOCIAL-002 repair.

- Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Baseline HEAD: `aca153d6dc7c17aea484140a20aacc107cd6e653`
- Canonical StudioFlow source inspected read-only: `/Users/toddknipple/Documents/StudioFlow/web`
- Existing unrelated dirty files were preserved and were not staged.
- Existing TPI-SOCIAL-001 and TPI-VIDEOS-001–009 reports were treated as historical evidence and re-run where current local checks existed.

The confirmed defect was in the Community Feed composer: a URL pasted directly into the main text field was published as text only. The existing dedicated Link control and external-routing path were preserved.

No production database, R2 object, authentication credential, StudioFlow source, or `/live-video` behavior was changed by this batch.
