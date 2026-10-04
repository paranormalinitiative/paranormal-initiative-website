// Transactional email for The Paranormal Initiative via Resend (resend.com).
// Configure with two Cloudflare secrets:
//   npx wrangler secret put RESEND_API_KEY   (from https://resend.com/api-keys)
//   npx wrangler secret put RESEND_FROM      (e.g. The Paranormal Initiative <notifications@paranormalinitiative.com>)
// When RESEND_API_KEY is absent, every helper below becomes a no-op and the
// site keeps working exactly as before email was connected.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function emailEnabled(env) {
  return Boolean(env && env.RESEND_API_KEY);
}

export function emailFrom(env) {
  return env.RESEND_FROM || "The Paranormal Initiative <onboarding@resend.dev>";
}

/**
 * Send one email through Resend. Never throws — callers decide how failures
 * are surfaced. Returns { ok, id?, error?, skipped? }.
 */
export async function sendEmail(env, { to, subject, html, text }) {
  if (!emailEnabled(env)) return { ok: false, skipped: true, error: "email-not-configured" };
  if (!to || !subject) return { ok: false, error: "missing-recipient-or-subject" };
  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: emailFrom(env),
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text: text || stripHtml(html)
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("resend send failed", response.status, data && data.message);
      return { ok: false, error: (data && data.message) || `resend-${response.status}` };
    }
    return { ok: true, id: data.id };
  } catch (error) {
    console.error("resend send threw", error);
    return { ok: false, error: "resend-unreachable" };
  }
}

// Human-friendly numeric codes (8 digits — large enough that guessing is
// impractical within the short expiry, short enough to type comfortably).
export function randomCode() {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return String(10000000 + (buffer[0] % 90000000));
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function layout({ kicker, heading, bodyHtml, code }) {
  const codeBlock = code ? `
      <div style="margin:28px 0;padding:18px 20px;background:#0d1017;border:1px solid #2a2f3e;border-radius:10px;text-align:center;">
        <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8d93a3;margin-bottom:8px;">Your code</div>
        <div style="font-size:32px;font-weight:700;letter-spacing:10px;color:#59a9dc;font-family:'SFMono-Regular',Consolas,monospace;">${code}</div>
        <div style="font-size:12px;color:#8d93a3;margin-top:10px;">This code expires in 30 minutes and can be used once.</div>
      </div>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#0a0c10;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;font-family:Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="background:#12151c;border:1px solid #1e2230;border-radius:14px;padding:36px 32px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#59a9dc;">${kicker}</p>
      <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:#e8ecf4;">${heading}</h1>
      <div style="font-size:14px;line-height:1.7;color:#c8cdd8;">${bodyHtml}</div>
      ${codeBlock}
      <p style="margin:26px 0 0;font-size:12px;line-height:1.6;color:#8d93a3;">If you didn't request this, you can safely ignore this email — your account is unchanged.</p>
    </div>
    <p style="margin:18px 0 0;text-align:center;font-size:11px;color:#8d93a3;">The Paranormal Initiative · <a href="https://paranormalinitiative.com" style="color:#59a9dc;text-decoration:none;">paranormalinitiative.com</a></p>
  </div>
</body>
</html>`;
}

export function verificationEmail(code) {
  return {
    subject: "Verify your email — The Paranormal Initiative",
    html: layout({
      kicker: "The Paranormal Initiative",
      heading: "Confirm your email address",
      code,
      bodyHtml: `<p>Welcome to The Paranormal Initiative community. Use the code below to verify the email address on your member account.</p><p>Verifying keeps your account recoverable and unlocks member features tied to a confirmed email.</p>`
    }),
    text: `Welcome to The Paranormal Initiative. Your email verification code is ${code}. It expires in 30 minutes and can be used once. If you didn't request this, ignore this email.`
  };
}

export function passwordResetEmail(code) {
  return {
    subject: "Reset your password — The Paranormal Initiative",
    html: layout({
      kicker: "Account Recovery",
      heading: "Reset your password",
      code,
      bodyHtml: `<p>Use the code below to choose a new password for your member account. For security it expires in 30 minutes and works only once.</p><p>Enter the code on the sign-in page where you requested the reset.</p>`
    }),
    text: `Your Paranormal Initiative password reset code is ${code}. It expires in 30 minutes and can be used once. If you didn't request this, ignore this email — your password is unchanged.`
  };
}

export function teamSubmissionAlertEmail({ name, city, state, country, submitterName }) {
  const place = [city, state || country].filter(Boolean).join(", ");
  return {
    subject: `New team submission: ${name}`,
    html: layout({
      kicker: "Paranormal Teams Directory",
      heading: "A new team is awaiting approval",
      bodyHtml: `
        <p><strong style="color:#e8ecf4;">${name}</strong>${place ? ` — ${place}` : ""}</p>
        <p>Submitted by ${submitterName || "an anonymous submitter"}.</p>
        <p style="margin-top:22px;">
          <a href="https://paranormalinitiative.com/teams/admin.html" style="display:inline-block;background:#59a9dc;color:#0a0c10;font-weight:600;font-size:14px;padding:11px 22px;border-radius:8px;text-decoration:none;">Open the approval queue</a>
        </p>`
    }),
    text: `New paranormal team submission: ${name}${place ? ` (${place})` : ""}. Submitted by ${submitterName || "an anonymous submitter"}. Approve or reject it at https://paranormalinitiative.com/teams/admin.html`
  };
}
