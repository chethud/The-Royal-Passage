import { PRODUCTION_SITE_ORIGIN } from "@/lib/auth-redirect";
import { isResendConfigured, sendResendEmail } from "@/lib/resend.server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/roles";

export type ProviderInviteRole = Extract<UserRole, "host" | "homestay_owner">;

export type CreatedProviderLogin = {
  userId: string;
  hostId: string | null;
  homestayOwnerId: string | null;
  createdNewUser: boolean;
  passwordEmailSent: boolean;
  passwordEmailWarning: string | null;
};

function randomPassword() {
  return `Trp-${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}!9`;
}

function getServerSiteOrigin(): string {
  const configured =
    process.env.VITE_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.VITE_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return PRODUCTION_SITE_ORIGIN;
}

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const normalized = email.trim().toLowerCase();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const match = (data.users ?? []).find((user) => (user.email ?? "").toLowerCase() === normalized);
    if (match) return match.id;
    if ((data.users ?? []).length < 200) break;
  }
  return null;
}

async function syncRoles(userId: string, roles: string[]) {
  const supabase = getSupabaseAdmin();
  await supabase.from("user_roles").delete().eq("user_id", userId);
  const { error } = await supabase.from("user_roles").insert(
    roles.map((role) => ({ user_id: userId, role })),
  );
  if (error) throw new Error(error.message);
}

function passwordSetupEmailHtml(input: {
  fullName: string;
  role: ProviderInviteRole;
  setupUrl: string;
}): string {
  const roleLabel = input.role === "host" ? "experience host" : "homestay owner";
  const dashboardPath = input.role === "host" ? "/host/dashboard" : "/homestay/dashboard";
  const origin = getServerSiteOrigin();

  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; background:#2A0000; color:#F7E7C2; padding:32px;">
    <div style="max-width:560px;margin:0 auto;background:#3A0A0A;border:1px solid rgba(247,231,194,0.25);padding:28px;">
      <p style="letter-spacing:0.18em;text-transform:uppercase;font-size:11px;color:#D4A84B;margin:0 0 12px;">The Royal Passage</p>
      <h1 style="font-size:28px;margin:0 0 16px;color:#F7E7C2;">Welcome, ${escapeHtml(input.fullName)}</h1>
      <p style="font-size:15px;line-height:1.6;color:rgba(247,231,194,0.9);">
        Your ${roleLabel} account is ready. Set your password to open your dashboard and manage your listing.
      </p>
      <p style="margin:28px 0;">
        <a href="${escapeHtml(input.setupUrl)}"
           style="display:inline-block;background:#D4A84B;color:#2A0000;text-decoration:none;padding:12px 22px;font-size:14px;font-weight:600;">
          Set your password
        </a>
      </p>
      <p style="font-size:13px;line-height:1.5;color:rgba(247,231,194,0.7);">
        After setting your password, sign in and visit
        <a href="${escapeHtml(`${origin}${dashboardPath}`)}" style="color:#D4A84B;">your dashboard</a>.
      </p>
    </div>
  </div>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendPasswordSetupEmail(input: {
  email: string;
  fullName: string;
  role: ProviderInviteRole;
}): Promise<{ sent: boolean; warning: string | null }> {
  const supabase = getSupabaseAdmin();
  const redirectTo = `${getServerSiteOrigin()}/reset-password?redirect=${encodeURIComponent(
    input.role === "host" ? "/host/dashboard" : "/homestay/dashboard",
  )}`;

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: input.email.trim().toLowerCase(),
    options: { redirectTo },
  });

  if (error) {
    return { sent: false, warning: `Password setup link could not be created: ${error.message}` };
  }

  const setupUrl =
    data.properties?.action_link ||
    (data as { action_link?: string }).action_link ||
    null;

  if (!setupUrl) {
    return { sent: false, warning: "Password setup link was empty — ask admin to resend from Users." };
  }

  if (!isResendConfigured()) {
    return {
      sent: false,
      warning:
        "Account created, but RESEND_API_KEY / RESEND_FROM_EMAIL is not configured — password email was not sent.",
    };
  }

  const sent = await sendResendEmail({
    to: input.email,
    subject:
      input.role === "host"
        ? "Set your host password — The Royal Passage"
        : "Set your property owner password — The Royal Passage",
    html: passwordSetupEmailHtml({
      fullName: input.fullName,
      role: input.role,
      setupUrl,
    }),
  });

  if (!sent) {
    return {
      sent: false,
      warning: "Account created, but the password setup email failed to send via Resend.",
    };
  }

  return { sent: true, warning: null };
}

/**
 * Create or reuse auth user + host/homestay_owner row, then send password setup email.
 * Host/owner rows are approved + verified for partner-publish flow.
 */
export async function createProviderLogin(input: {
  email: string;
  fullName: string;
  phone?: string | null;
  bio?: string | null;
  role: ProviderInviteRole;
  address?: string | null;
}): Promise<CreatedProviderLogin> {
  const supabase = getSupabaseAdmin();
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const phone = input.phone?.trim() || null;
  const bio = input.bio?.trim() || null;

  let userId = await findAuthUserIdByEmail(email);
  let createdNewUser = false;

  if (!userId) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password: randomPassword(),
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
      },
    });
    if (error || !created.user) {
      // Race: user may have been created concurrently
      userId = await findAuthUserIdByEmail(email);
      if (!userId) {
        throw new Error(error?.message ?? "Failed to create user login.");
      }
    } else {
      userId = created.user.id;
      createdNewUser = true;
    }
  }

  let hostId: string | null = null;
  let homestayOwnerId: string | null = null;

  if (input.role === "host") {
    const { data: existingHost } = await supabase
      .from("hosts")
      .select("id")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (existingHost?.id) {
      hostId = String(existingHost.id);
      await supabase
        .from("hosts")
        .update({
          display_name: fullName,
          email,
          phone,
          bio,
          verified: true,
          approval_status: "approved",
        })
        .eq("id", hostId);
    } else {
      const { data: hostRow, error: hostError } = await supabase
        .from("hosts")
        .insert({
          auth_user_id: userId,
          display_name: fullName,
          email,
          phone,
          bio,
          verified: true,
          approval_status: "approved",
        })
        .select("id")
        .single();
      if (hostError || !hostRow) {
        throw new Error(hostError?.message ?? "Failed to create host profile.");
      }
      hostId = String(hostRow.id);
    }
  }

  if (input.role === "homestay_owner") {
    const { data: existingOwner } = await supabase
      .from("homestay_owners")
      .select("id")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (existingOwner?.id) {
      homestayOwnerId = String(existingOwner.id);
      await supabase
        .from("homestay_owners")
        .update({
          full_name: fullName,
          email,
          phone,
          address: input.address?.trim() || null,
          verified: true,
          approval_status: "approved",
        })
        .eq("id", homestayOwnerId);
    } else {
      const { data: ownerRow, error: ownerError } = await supabase
        .from("homestay_owners")
        .insert({
          auth_user_id: userId,
          full_name: fullName,
          email,
          phone,
          address: input.address?.trim() || null,
          verified: true,
          approval_status: "approved",
        })
        .select("id")
        .single();
      if (ownerError || !ownerRow) {
        throw new Error(ownerError?.message ?? "Failed to create homestay owner profile.");
      }
      homestayOwnerId = String(ownerRow.id);
    }
  }

  const profilePatch: Record<string, unknown> = {
    id: userId,
    full_name: fullName,
    phone,
    role: input.role,
  };
  if (hostId) profilePatch.host_id = hostId;
  if (homestayOwnerId) profilePatch.homestay_owner_id = homestayOwnerId;

  const { error: profileError } = await supabase.from("profiles").upsert(profilePatch);
  if (profileError) throw new Error(profileError.message);

  await supabase
    .from("profiles")
    .update({
      role: input.role,
      full_name: fullName,
      phone,
      ...(hostId ? { host_id: hostId } : {}),
      ...(homestayOwnerId ? { homestay_owner_id: homestayOwnerId } : {}),
    })
    .eq("id", userId);

  // Preserve multi-role if guest/etc already present — ensure provider role is included.
  const { data: existingRoles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = new Set((existingRoles ?? []).map((r) => String(r.role)));
  roles.add(input.role);
  // Primary provider role; drop guest if promoting
  if (roles.has("guest") && (input.role === "host" || input.role === "homestay_owner")) {
    roles.delete("guest");
  }
  await syncRoles(userId, [...roles]);

  try {
    await supabase.auth.admin.updateUserById(userId, {
      app_metadata: {
        role: input.role,
        roles: [...roles],
      },
    });
  } catch {
    // Non-fatal
  }

  const emailResult = await sendPasswordSetupEmail({
    email,
    fullName,
    role: input.role,
  });

  return {
    userId,
    hostId,
    homestayOwnerId,
    createdNewUser,
    passwordEmailSent: emailResult.sent,
    passwordEmailWarning: emailResult.warning,
  };
}

export function slugifyTitle(title: string, fallbackPrefix: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || `${fallbackPrefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function ensureUniqueSlug(
  table: "experiences" | "homestays",
  baseSlug: string,
): Promise<string> {
  const supabase = getSupabaseAdmin();
  let candidate = baseSlug;
  let suffix = 1;
  while (suffix < 100) {
    const { data } = await supabase.from(table).select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;
}
