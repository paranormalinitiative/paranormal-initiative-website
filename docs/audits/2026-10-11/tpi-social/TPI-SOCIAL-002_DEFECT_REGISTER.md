# TPI-SOCIAL-002 Defect Register

## SOCIAL-002-001 — Direct pasted URLs did not create Feed previews

- Severity: **HIGH — repaired**
- Symptom: typing a URL into the main Community Feed composer produced plain post text; the preview flow only ran through the separate Link control.
- Root cause: the composer did not extract URLs from its body or add them to the existing link-attachment payload.
- Repair: `member-home.html` now extracts up to five valid HTTP(S) URLs from the existing composer body, persists them through the existing attachment model, and hydrates the existing preview card with stale-request protection.
- Verification: disposable browser member session rendered a NASA preview image (`3000 × 2400` natural dimensions), preserved `https://www.nasa.gov/`, used `_blank` plus `noopener noreferrer`, published, and re-rendered the preview after reload.

No other confirmed runtime defect was repaired in this batch. Existing limitations remain documented in the focused reports below.
