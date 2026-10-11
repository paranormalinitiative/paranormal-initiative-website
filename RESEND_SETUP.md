# Resend Email Setup — The Paranormal Initiative

> **Status note — TPI-DOCS-001:** This file is retained as setup/reference
> material. It is not evidence that TPI's current provider, domain, sender,
> secrets, templates, workflows, or mailbox delivery have been independently
> verified. The future TPI-FINAL-002 email audit must test actual delivery and
> token behavior with an authorized mailbox. Resend was selected for the
> separate THE CAULDRON & THE CRAFT project; that decision does not authorize
> copying its credentials or replacing TPI's provider.

The historical setup assumption in this document is Resend for transactional
email. The live TPI provider and configuration still require an explicit audit.
Three things use it once the secrets below are set:

1. **Member email verification** — new members get a code on signup; members
   can re-send it from the Member Dashboard ("Email Not Verified" card).
2. **Password reset** — "Forgot Password?" on the sign-in page emails an
   8-digit code; the code + new password are entered right there.
3. **Team submission alerts** — leadership gets an email whenever a team is
   submitted to the Paranormal Teams Directory (plus the in-site notification).

The code paths and setup steps below are historical guidance. Do not treat the
presence or absence of these secrets as proof of actual delivery until the
future email audit verifies the live environment.

## One-time setup (about 5 minutes)

1. **Sign in at [resend.com](https://resend.com)** and open
   [resend.com/onboarding](https://resend.com/onboarding).
2. **Create an API key** at [resend.com/api-keys](https://resend.com/api-keys)
   → *Create API Key* → name it `tpi-website`, permission **Sending access**.
   Copy the key (starts with `re_`) — you'll need it in step 4.
3. **Add your sending domain**: Resend dashboard → *Domains* → *Add Domain*
   → `paranormalinitiative.com`. Resend shows DNS records (SPF, DKIM, etc.);
   add them wherever paranormalinitiative.com's DNS is managed, then click
   *Verify* in Resend. Until the domain is verified you can still test using
   the shared `onboarding@resend.dev` sender, which only delivers to **your
   own account email**.
4. **Set the two Cloudflare secrets** (from the repo root):

   ```bash
   npx wrangler secret put RESEND_API_KEY
   # paste: re_...your key...

   npx wrangler secret put RESEND_FROM
   # paste: The Paranormal Initiative <notifications@paranormalinitiative.com>
   ```

   (Any mailbox@paranormalinitiative.com works, e.g. `notifications@` or
   `noreply@` — it does not need to exist as a real mailbox once the domain
   is verified in Resend.)

5. **Redeploy** so the running worker picks the secrets up:

   ```bash
   npx wrangler deploy
   ```

## How to tell it's working

- Resend dashboard → *Emails* shows every message with delivered/opened status.
- Resend's free tier is 100 emails/day, 3,000/month — far above current needs.

## How it behaves without the secrets

Nothing breaks. Every email helper checks for `RESEND_API_KEY` and silently
no-ops when it's absent; password reset then says "reset instructions will be
sent" without emailing, and the verify-email card reports that delivery isn't
configured yet. Local development (`.dev.vars` with an empty key) runs exactly
this way.
