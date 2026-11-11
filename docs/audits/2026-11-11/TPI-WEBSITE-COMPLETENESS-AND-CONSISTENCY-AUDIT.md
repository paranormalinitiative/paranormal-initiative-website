# TPI Website Completeness and Consistency Audit

Date: 2026-11-11  
Status: **AUDIT COMPLETE; SHARED-ASSET CACHE CONSISTENCY REPAIR IN PROGRESS**  
Scope: canonical website repository, current source and release records. This is a
repository-wide static/documentation audit plus focused verification of the shared
member shell and profile assets. It is not a manual visual acceptance of every route.

## Scope boundaries

- Reviewed the canonical website checkout and the current development branch.
- Examined current project status, future-work register, QA dashboard, recent profile
  and Founding Membership release records, and shared shell/profile asset references.
- Inventoried the tracked HTML pages. Five standalone reference books and the complete
  `haunted-location-directory/` tree were excluded from edits. No book text or other
  Repository book content was edited.
- No production account, membership, profile, honor, article, or other owner data was
  changed by this audit.

## What is complete and supported by current evidence

The following recent user-facing profile work has its own deployed completion record:

- Shared community-style member profile, profile-specific feed, and profile actions.
- A blank cover for members without a saved banner, with Todd's saved banner retained.
- Shared profile layout and right rail across member pages.
- Clickable compact Honors & Distinctions tiles styled to match the right-rail tiles.
- Transparent Founding All-Access, Contributor, and Creator artwork used through the
  shared recognition surfaces.
- Heather's dual capabilities and FAA-001 were checked read-only and the shared
  profile displays the founding identity without the misleading generic access label.
- Messenger desktop opening width was repaired in a separate release record.

The release records report focused profile browser acceptance, broader isolated Firefox
acceptance, guarded preflight, and production verification. These are prior-release
results and do not count as verification of the cache-consistency change in this audit.
See the linked completion records in the master status document.

## Audit findings

### Confirmed inconsistency: shared asset cache keys

The shared member shell was not requested consistently. Static pages used multiple
`member-shell.js` versions (`55` through `58`), the `includes.js` automatic loader
requested `56`, and profile/shared styles and scripts also had different versions.
That could leave otherwise identical member routes rendering old navigation or profile
styles until cache expiry. The source contains one shared shell implementation, so these
version differences were not intentional page variants.

**Repair started:** all in-scope HTML references were aligned to one current version per
shared asset, and the automatic loader was updated to those same shell versions. A
repeatable verifier now checks the in-scope references. At this audit checkpoint it
passes for 237 HTML files. The five standalone books and Haunted Locations directory
remain excluded.

The aligned cache keys are `style.css?v=92`, `member-shell.css?v=63`,
`member-shell.js?v=59`, `profile-style.css?v=6`, `profile-style.js?v=2`,
`includes.js?v=18`, and `api-client.js?v=18` wherever those shared assets are
referenced. The automatic member-shell loader requests the same CSS and JS versions.

### Confirmed documentation drift

- `docs/planning/TPI-DOCS-001_MASTER_STATUS.md` current introductory sections still
  described the Founding Membership registry as empty and FAA-001 as unissued, and
  described current priorities that were superseded by later work.
- `docs/quality-assurance/QA_DASHBOARD.md` and `QA_TEST_INVENTORY.md` still present an
  October 11 baseline as their latest snapshot even though November 11 profile and badge
  release evidence exists.
- `docs/TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/TPI-FUTURE-WORK-REGISTER.md` is still
  useful for genuinely future governance and platform work, but the file's effective
  date and completion cross-reference need to reflect the recent profile and badge
  deliveries.

The historical entries are retained as history. Current status is being added ahead of
them with links to the newer evidence.

## In progress

- **Shared-asset consistency repair:** version references and regression check are
  implemented locally; guarded release and live verification remain.
- **Education Center organization and visual direction:** owner-led iterative work is
  continuing. The requested broad paranormal/metaphysical scope, subject shelves, and
  imagery direction should remain visible in the current task queue; the owner said the
  image would be revisited later.
- **Community/profile acceptance:** the common profile structure is implemented, but
  owners are still reviewing presentation details (banner crop/size, profile text
  formatting, About visibility, member honors). A deployed implementation is not the
  same as owner visual acceptance.
- **Messenger:** a usable desktop launch size is recorded as fixed; the planned
  logged-in member-to-member workflow and related feature checks were interrupted and
  need a fresh joint acceptance session.

## Still open / future work

- Complete an authenticated Administration Center functional and visual audit.
- Complete the broader multi-member social workflow and production member acceptance
  called out in the current roadmap and QA records.
- Continue remaining Nova, Education publishing, governance, Community Standards,
  Help Center, and future platform work in the authoritative future-work register.
- Resolve external-provider and physical-device acceptance for media features as
  described in the QA inventory.
- Review profile/About presentation with the owner after the current iteration.

## Limits and next release gate

The 237-file verifier proves cache-version consistency for its declared shared assets;
it does not prove that every page's design is visually identical or that every
interactive feature works. This audit did not visit all 237 routes manually. Existing
profile and release test results remain attached to their respective source commits.

Before this user-facing repair is complete, run the repository's required local auth
lifecycle and guarded release preflight, deploy the certified candidate through the
approved workflow, and verify the deployed result in an isolated Firefox profile.
Record that evidence below and in the master status snapshot.

## Repair release evidence

Pending at audit authoring time.
