/**
 * Send a test email via Resend API and/or Supabase Auth (Resend SMTP).
 *
 * Usage:
 *   npm run email:test
 *   npm run email:test -- chethannd05@gmail.com
 *
 * Env (.env.local):
 *   RESEND_API_KEY=re_...          — direct Resend API test
 *   RESEND_FROM_EMAIL=noreplay@theroyalpassage.com
 *   RESEND_FROM_NAME=The Royal Passage
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY — Supabase auth email test (magic link)
 */

const to = process.argv[2]?.trim() || "chethannd05@gmail.com";
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreplay@theroyalpassage.com";
const fromName = process.env.RESEND_FROM_NAME || "The Royal Passage";
const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || "https://the-royal-passage.vercel.app").replace(/\/$/, "");
const logoUrl = (process.env.EMAIL_LOGO_URL || `${siteUrl}/brand/logo.png`).trim();

function brandedTestHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<body style="font-family: Georgia, 'Times New Roman', Times, serif; color: #3d2314; background-color: #ebe3d4; margin: 0; padding: 28px 14px;">
  <div style="max-width: 580px; margin: 0 auto; background: #fffdf8; border: 1px solid #d9c9ad; border-radius: 6px; overflow: hidden;">
    <div style="height: 5px; background: linear-gradient(90deg, #4a0a14 0%, #b8860b 50%, #4a0a14 100%);"></div>
    <div style="padding: 28px 30px;">
      <div style="text-align: center; margin-bottom: 22px; padding-bottom: 20px; border-bottom: 1px solid #e0d4c0;">
        <img src="${logoUrl}" alt="The Royal Passage" width="148" style="display: block; margin: 0 auto 10px; max-width: 168px; height: auto;" />
        <p style="margin: 0; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #9a7b4f;">Mysuru · Curated royal journeys</p>
      </div>
      <h1 style="margin: 0 0 16px; font-size: 23px; font-weight: normal; color: #5c1a24; text-align: center;">Resend test</h1>
      <p style="line-height: 1.6;">Hello,</p>
      <p style="line-height: 1.6;">This is a test message from <strong>The Royal Passage</strong> sent through Resend.</p>
      <p style="line-height: 1.6;">Sender: ${fromEmail}</p>
      <p style="line-height: 1.6;">If you received this, your domain and API key are working.</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendViaResend() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "the-royal-passage/1.0",
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject: "The Royal Passage — Resend test",
      html: brandedTestHtml(),
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || body.error || `Resend API failed (${response.status})`);
  }

  console.log("Resend API: email queued.");
  console.log("  id:", body.id);
  console.log("  from:", fromEmail);
  console.log("  to:", to);
  return true;
}

async function sendViaSupabaseAuth() {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY for Supabase auth email test.");
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.auth.signInWithOtp({
    email: to,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });

  if (error) throw error;

  console.log("Supabase Auth: magic-link email sent (uses Resend SMTP if configured in dashboard).");
  console.log("  to:", to);
  console.log("  redirect:", `${siteUrl}/auth/callback`);
  return true;
}

async function main() {
  console.log(`Sending test email to ${to}...\n`);

  let sent = false;
  if (process.env.RESEND_API_KEY?.trim()) {
    sent = await sendViaResend();
  }

  if (!sent) {
    if (!process.env.RESEND_API_KEY?.trim()) {
      console.log("RESEND_API_KEY not set — skipping direct Resend API test.\n");
    }
    await sendViaSupabaseAuth();
  }

  console.log("\nDone. Check your inbox (and spam folder).");
}

main().catch((err) => {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
