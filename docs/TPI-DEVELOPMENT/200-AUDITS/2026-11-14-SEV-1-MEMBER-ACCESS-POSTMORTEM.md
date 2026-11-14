# SEV-1 Member Access Incident Postmortem

Date of incident: 2026-11-13 through 2026-11-14

Incident ID: `TPI-SEV1-AUTH-2026-11-13`

Classification: **SEV-1 / catastrophic member-access failure**

Status: **Resolved, deployed, live verified, and owner accepted**

## Executive summary

The production member-access system failed its most important recovery promise:
an existing member who could not remember a password could not reliably recover
the account, understand whether recovery succeeded, or remain signed in after a
successful password change. The owner was locked out of the production site and
encountered a sequence of separate defects while attempting recovery.

This is classified as catastrophic because the same defective production path
was available to every member, the owner could not administer the site through
the affected account, and the recovery experience could cause members to leave
without a support path. The classification does not assert that every member
was affected, that member data was lost, or that TPI was breached. No evidence
of data loss, credential disclosure, account takeover, or destructive database
change was found during this response.

The owner confirmed that production Sign In opened Member Home after the final
legacy Admin session repair. Additional recovery limits, single-use code
protection, hosted-service safeguards, and release gates were then deployed.
Password storage was subsequently modernized in a separate verified follow-up:
new and changed credentials now use salted PBKDF2-SHA-256, while legacy
SHA-256 records upgrade after successful login without a bulk rewrite.

## Member-visible impact

- The production page showed stale **Contributor Access** language instead of
  the expected **Member Login** and **Member Access** language.
- The reset request could create a token without delivering a usable recovery
  path.
- The first repaired form exposed reset fields without a final **Save New
  Password** action.
- A member who already had a code could still be blocked by an unrelated email
  field and by a generic live-service availability probe.
- A successful reset initially placed its result outside the visible recovery
  panel and did not clearly sign the member in or open Member Home.
- The owner's valid production session then failed during identity resolution
  and bounced from Member Home back to Member Login.
- The page reported a normal username/password mismatch during parts of the
  incident even though the larger problem involved recovery and session
  confirmation.

## Confirmed failure chain

1. Password recovery was incomplete in production: email delivery and the
   confirmation endpoint were not connected as one tested lifecycle.
2. The first repair still omitted or hid the member's final save action because
   source assertions did not exercise the rendered browser workflow.
3. Recovery calls were incorrectly gated by `/api/auth/me`, allowing an
   unrelated availability or session failure to block reset operations.
4. Reset success feedback was placed outside the visible panel and did not
   provide a reliable signed-in handoff to Member Home.
5. Production lacked the optional `staff_role_appointments` table. A second
   unguarded query to that table caused `/api/auth/me` to fail for the legacy
   Admin account even though the account and session were valid.
6. Existing release acceptance covered a synthetic member but did not cover
   the production legacy Admin identity or the complete recovery interaction.

## Corrective actions completed

- Restored **Member Login** and **Member Access** wording.
- Connected reset requests to the configured mail provider and added the
  confirmation endpoint.
- Added a permanently visible **Save New Password** action with independent
  code and password fields.
- Added inline request, validation, saving, success, and failure messages.
- Added a fresh session after reset and a verified Member Home handoff.
- Added a password visibility control to sign-in and password fields.
- Removed hosted sign-in, registration, invitation, and recovery dependence on
  stale browser-only account fallbacks.
- Added a guarded legacy Admin identity fallback when the optional staff-role
  table is unavailable.
- Normalized reset-code and session expiration comparisons.
- Added request and confirmation attempt limits, a rolling account code cap,
  and a conditional single-use reset-code claim.
- Added legacy Admin, password-recovery API, and Firefox interaction checks to
  the guarded production release.

Final recovery release: `rel-ad0198bcf13d-be5a64930272`

Final Worker version: `c26d3d21-3d0e-4fe3-b401-87b4403f58a8`

Owner acceptance: production Sign In opened Member Home.

## Wider November 13 infrastructure context

November 13 also had confirmed, widespread infrastructure disruptions affecting
businesses and individuals. This context is material because TPI runs on
Cloudflare, but it does not replace the confirmed TPI root-cause evidence.

- Cloudflare reported increased North American Durable Objects errors from
  November 12 at 22:39 UTC until November 13 at 03:44 UTC after a sudden traffic
  increase: [Cloudflare incident](https://www.cloudflarestatus.com/incidents/9zxr2bkqoct7).
- Cloudflare reported elevated Worker startup errors from 13:54 to 15:16 UTC:
  [Cloudflare incident](https://www.cloudflarestatus.com/incidents/y03on2svrrxt).
- Cloudflare reported Worker API 5xx errors beginning at 15:31 UTC and said a
  fix was being monitored by 15:42 UTC:
  [Cloudflare incident](https://www.cloudflarestatus.com/incidents/e7ktq32gphhe).
- Microsoft 365 experienced a separate worldwide service disruption affecting
  Outlook, Teams, Copilot, and other services. Microsoft reported no indication
  of malicious activity:
  [Associated Press report](https://apnews.com/article/d92547a821930290db2964388016979a).
- The FAA issued a nationwide ground stop because communications problems
  affected multiple Air Route Traffic Control Centers:
  [FAA statement](https://www.faa.gov/newsroom/faa-statement-nationwide-ground-stop) and
  [FAA advisory](https://www.fly.faa.gov/ois/oisedit/adv_oisedit_dis?day=11132026&gdp=-1&gstop=196093&number=120).
- The tanker *Atlantic Asphalt* struck the docked *American Heritage* in New
  Orleans. The Coast Guard described an apparent steering loss, while the cause
  remained under investigation:
  [Associated Press report](https://apnews.com/article/new-orleans-tanker-river-cruise-rescue-passengers-757bed7a70ceb72f0d7140143fe2a764).

No reviewed source established a common cause connecting these events, a
coordinated cyberattack, or an attack on TPI. The Cloudflare incident windows
also do not explain the owner's later, reproducible login bounce: TPI produced
that failure through its own missing-table compatibility bug. External service
instability could have complicated deployment or availability earlier in the
day, but that remains unproven. At the time of review, the
[public AWS health history](https://health.aws.amazon.com/health/status)
did not show a comparable broad November 13 AWS outage.

## Required operating standard

Member access is now a release-blocking lifecycle, not a collection of separate
controls. A release must prove request, delivery handling, code entry, password
save, new session confirmation, Member Home arrival, legacy Admin access,
logout, expiry, and visible failure feedback. A green anonymous smoke test is
insufficient evidence for member access.

Any future member-access failure that prevents login and recovery, affects the
owner account, or can strand an unknown number of members must be opened as a
SEV-1 incident until blast radius and recovery are established.

## Remaining actions

The unresolved security and resilience work is tracked in
[Member Access Resilience Audit](2026-11-14-MEMBER-ACCESS-RESILIENCE-AUDIT.md),
including delivery-failure monitoring, recovery transaction boundaries,
staff-schema readiness, distributed attempt-limit behavior, and the API async
error boundary. Password-hash modernization is complete in release
`rel-710b6c9126f5-dedd127c76c8`; see the
[completion record](../300-COMPLETED-WORK/2026-11-14-PASSWORD-HASH-MODERNIZATION.md).
