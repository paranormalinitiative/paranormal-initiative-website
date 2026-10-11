# TPI-VIDEOS-004 Playback and Availability

Approved external provider URLs can be stored as playback metadata through the
authenticated owner endpoint. URL/provider validation reuses the existing TPI
provider allowlist. Entering a URL sets `playback_verified = 0`; it is not
treated as proof that a stream is reachable or decodable.

Public live discovery requires a published listing, approved moderation state,
`live` lifecycle status, and `playback_verified = 1`. No verification service
or external provider session was available in this batch.

Local provider metadata validation: PASS. Actual external playback,
H.264/AAC decode, provider delivery, and verified public playback: NOT YET
VERIFIED.
