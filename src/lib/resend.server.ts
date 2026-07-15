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

export async function sendResendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const to = input.to.trim();
  const apiKey = readEnv("RESEND_API_KEY");
  const fromEmail = readEnv("RESEND_FROM_EMAIL");
  const fromName = readEnv("RESEND_FROM_NAME") ?? "The Royal Passage";

  if (!to || !apiKey || !fromEmail) {
    return false;
  }

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

  return response.ok;
}
