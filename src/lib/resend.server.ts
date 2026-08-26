/** Server-only Resend transactional email. */

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function isResendConfigured(): boolean {
  return Boolean(readEnv("RESEND_API_KEY") && readEnv("RESEND_FROM_EMAIL"));
}

export type ResendSendResult =
  | { ok: true }
  | { ok: false; error: string };

export async function sendResendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const result = await sendResendEmailDetailed(input);
  return result.ok;
}

export async function sendResendEmailDetailed(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<ResendSendResult> {
  const to = input.to.trim();
  const apiKey = readEnv("RESEND_API_KEY");
  const fromEmail = readEnv("RESEND_FROM_EMAIL");
  const fromName = readEnv("RESEND_FROM_NAME") ?? "The Royal Passage";

  if (!to) {
    return { ok: false, error: "Recipient email is empty." };
  }
  if (!apiKey || !fromEmail) {
    return {
      ok: false,
      error: "RESEND_API_KEY / RESEND_FROM_EMAIL is not configured on the server.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        subject: input.subject,
        html: input.html,
      }),
    });

    if (response.ok) {
      return { ok: true };
    }

    let detail = `Resend HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string; name?: string };
      if (body.message) detail = body.message;
      else if (body.name) detail = `${body.name}: ${detail}`;
    } catch {
      // ignore parse errors
    }
    return { ok: false, error: detail };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to reach Resend.",
    };
  }
}
