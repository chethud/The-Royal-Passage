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
const siteUrl = process.env.VITE_SITE_URL || "https://the-royal-passage.vercel.app";

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
      html: `
        <p>Hello,</p>
        <p>This is a test message from <strong>The Royal Passage</strong> sent through Resend.</p>
        <p>Sender: ${fromEmail}</p>
        <p>If you received this, your domain and API key are working.</p>
      `,
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
