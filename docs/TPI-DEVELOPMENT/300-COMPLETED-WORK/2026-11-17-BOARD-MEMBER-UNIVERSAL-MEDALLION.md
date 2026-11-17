# Board Member universal medallion clarification

Date: 2026-11-17

## Decision

The Paranormal Initiative has one Board-specific artwork set: the owner-supplied
Board Member badge and its 256px/512px web derivatives. The Gold, Silver, and
Bronze artwork belongs to the separate Society / Leadership distinction system
and is not used to rank Board appointments.

## Implementation

- Every Board role now uses the universal `Board Member Medallion`.
- Board Chair, Board Vice Chair, Committee Chair, Board Member, and Advisory
  Board Member remain distinct assignable roles.
- The selected paranormal domain still generates the public title, for example:
  `Advisory Board Member — Ethics & Professional Conduct`.
- Legacy database rank metadata remains in place for additive compatibility, but
  Board profile payloads normalize to the universal Board Member medallion.
- Leadership Gold/Silver/Bronze distinctions remain available only through the
  separate Leadership workflow.

## Keith's proposed appointment

Recommended role: `Advisory Board Member`.

Recommended domain: `Ethics & Professional Conduct`.

This reflects advisory responsibility for the ethical sharing of paranormal
experiments, extraordinary contact claims, consent, safety, verification, and
level-headed review without implying a scientific credential.

## Verification

The Board Member source contract must continue to pass, including the universal
medallion check, protected assignment routes, duplicate active appointment
protection, badge asset checks, and revoke controls.
