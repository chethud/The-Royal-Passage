import { createClient } from "@supabase/supabase-js";
import { PRODUCTION_SITE_ORIGIN } from "@/lib/auth-redirect";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env.server";
import { isResendConfigured, sendResendEmailDetailed } from "@/lib/resend.server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/roles";

export type ProviderInviteRole = Extract<UserRole, "host" | "homestay_owner" | "travel_agent">;

export type CreatedProviderLogin = {
  userId: string;
  hostId: string | null;
  homestayOwnerId: string | null;
  travelAgentId: string | null;
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

function providerDashboardPath(role: ProviderInviteRole): string {
  if (role === "host") return "/host/dashboard";
  if (role === "travel_agent") return "/travel-agent/dashboard";
  return "/homestay/dashboard";
}

function providerRoleLabel(role: ProviderInviteRole): string {
  if (role === "host") return "experience host";
  if (role === "travel_agent") return "travel agent";
  return "homestay owner";
}

function temporaryPasswordEmailHtml(input: {
  fullName: string;
  role: ProviderInviteRole;
  email: string;
  temporaryPassword: string;
  signInUrl: string;
  dashboardUrl: string;
}): string {
  const roleLabel = providerRoleLabel(input.role);
  const dashboardHint =
    input.role === "travel_agent"
      ? "to book experiences and homestays for your clients."
      : "to manage your listing.";

  return `
  <div style="font-family: Georgia, 'Times New Roman', serif; background:#2A0000; color:#F7E7C2; padding:32px;">
    <div style="max-width:560px;margin:0 auto;background:#3A0A0A;border:1px solid rgba(247,231,194,0.25);padding:28px;">
      <p style="letter-spacing:0.18em;text-transform:uppercase;font-size:11px;color:#D4A84B;margin:0 0 12px;">The Royal Passage</p>
      <h1 style="font-size:28px;margin:0 0 16px;color:#F7E7C2;">Welcome, ${escapeHtml(input.fullName)}</h1>
      <p style="font-size:15px;line-height:1.6;color:rgba(247,231,194,0.9);">
        Your ${roleLabel} application was approved. Use the temporary password below to sign in, then change it from your profile.
      </p>
      <div style="margin:24px 0;padding:16px 18px;background:rgba(0,0,0,0.28);border:1px solid rgba(247,231,194,0.18);">
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#D4A84B;">Sign-in email</p>
        <p style="margin:0 0 16px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;color:#F7E7C2;">${escapeHtml(input.email)}</p>
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#D4A84B;">Temporary password</p>
        <p style="margin:0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:15px;color:#F7E7C2;">${escapeHtml(input.temporaryPassword)}</p>
      </div>
      <p style="margin:28px 0;">
        <a href="${escapeHtml(input.signInUrl)}"
           style="display:inline-block;background:#D4A84B;color:#2A0000;text-decoration:none;padding:12px 22px;font-size:14px;font-weight:600;">
          Sign in
        </a>
      </p>
      <p style="font-size:13px;line-height:1.5;color:rgba(247,231,194,0.7);">
        After signing in, open
        <a href="${escapeHtml(input.dashboardUrl)}" style="color:#D4A84B;">your dashboard</a>
        ${dashboardHint}
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

/**
 * Same delivery path as “Forgot password” (Supabase Auth SMTP).
 * Used when Resend API cannot send the temporary-password email.
 */
async function sendSupabasePasswordSetupLink(input: {
  email: string;
  role: ProviderInviteRole;
}): Promise<{ sent: boolean; error: string | null }> {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) {
    return {
      sent: false,
      error: "Supabase URL / anon key missing — cannot send password setup link.",
    };
  }

  const origin = getServerSiteOrigin();
  const dashboardPath = providerDashboardPath(input.role);
  const redirectTo = `${origin}/reset-password?redirect=${encodeURIComponent(dashboardPath)}`;

  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.resetPasswordForEmail(input.email.trim().toLowerCase(), {
    redirectTo,
  });
  if (error) {
    return { sent: false, error: error.message };
  }
  return { sent: true, error: null };
}

export async function sendTemporaryPasswordEmail(input: {
  email: string;
  fullName: string;
  role: ProviderInviteRole;
  temporaryPassword: string;
}): Promise<{ sent: boolean; warning: string | null }> {
  const origin = getServerSiteOrigin();
  const dashboardPath = providerDashboardPath(input.role);
  const signInUrl = `${origin}/sign-in?redirect=${encodeURIComponent(dashboardPath)}`;
  const dashboardUrl = `${origin}${dashboardPath}`;

  if (isResendConfigured()) {
    const result = await sendResendEmailDetailed({
      to: input.email,
      subject:
        input.role === "host"
          ? "Your host login — The Royal Passage"
          : input.role === "travel_agent"
            ? "Your travel agent login — The Royal Passage"
            : "Your property owner login — The Royal Passage",
      html: temporaryPasswordEmailHtml({
        fullName: input.fullName,
        role: input.role,
        email: input.email.trim().toLowerCase(),
        temporaryPassword: input.temporaryPassword,
        signInUrl,
        dashboardUrl,
      }),
    });

    if (result.ok) {
      return { sent: true, warning: null };
    }

    const fallback = await sendSupabasePasswordSetupLink({
      email: input.email,
      role: input.role,
    });
    if (fallback.sent) {
      return {
        sent: true,
        warning: `Temporary-password email failed (${result.error}). Sent a password setup link instead (same as Forgot password).`,
      };
    }

    return {
      sent: false,
      warning: `Account created, but no login email was sent. Resend: ${result.error}. Setup link: ${fallback.error ?? "failed"}.`,
    };
  }

  const fallback = await sendSupabasePasswordSetupLink({
    email: input.email,
    role: input.role,
  });
  if (fallback.sent) {
    return {
      sent: true,
      warning:
        "RESEND_API_KEY is not configured — sent a password setup link via Supabase (same as Forgot password) instead of a temporary password email.",
    };
  }

  return {
    sent: false,
    warning: `Account created, but the login email was not sent: ${fallback.error ?? "unknown error"}`,
  };
}

/** Resets password and emails the temporary credentials. */
export async function sendPasswordSetupEmail(input: {
  email: string;
  fullName: string;
  role: ProviderInviteRole;
}): Promise<{ sent: boolean; warning: string | null }> {
  const supabase = getSupabaseAdmin();
  const temporaryPassword = randomPassword();
  const userId = await findAuthUserIdByEmail(input.email);
  if (!userId) {
    return { sent: false, warning: "Could not find the user login to set a temporary password." };
  }
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: temporaryPassword,
    email_confirm: true,
  });
  if (error) {
    return { sent: false, warning: `Could not set temporary password: ${error.message}` };
  }
  return sendTemporaryPasswordEmail({
    email: input.email,
    fullName: input.fullName,
    role: input.role,
    temporaryPassword,
  });
}

/**
 * Create or reuse auth user + host/homestay_owner row, then email a temporary password.
 * Host/owner rows are approved + verified for partner-publish flow.
 */
export async function createProviderLogin(input: {
  email: string;
  fullName: string;
  phone?: string | null;
  bio?: string | null;
  role: ProviderInviteRole;
  address?: string | null;
  companyName?: string | null;
  city?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  gstCertificateUrl?: string | null;
  companyRegistrationUrl?: string | null;
  passportPhotoUrl?: string | null;
  discountPercent?: number | null;
}): Promise<CreatedProviderLogin> {
  const supabase = getSupabaseAdmin();
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const phone = input.phone?.trim() || null;
  const bio = input.bio?.trim() || null;
  const temporaryPassword = randomPassword();

  let userId = await findAuthUserIdByEmail(email);
  let createdNewUser = false;

  if (!userId) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
      },
    });
    if (error || !created.user) {
      userId = await findAuthUserIdByEmail(email);
      if (!userId) {
        throw new Error(error?.message ?? "Failed to create user login.");
      }
      const { error: resetError } = await supabase.auth.admin.updateUserById(userId, {
        password: temporaryPassword,
        email_confirm: true,
      });
      if (resetError) {
        throw new Error(resetError.message);
      }
    } else {
      userId = created.user.id;
      createdNewUser = true;
    }
  } else {
    const { error: resetError } = await supabase.auth.admin.updateUserById(userId, {
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
      },
    });
    if (resetError) {
      throw new Error(resetError.message);
    }
  }

  let hostId: string | null = null;
  let homestayOwnerId: string | null = null;
  let travelAgentId: string | null = null;

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
      const { data: orphanHost } = await supabase
        .from("hosts")
        .select("id")
        .eq("email", email)
        .is("auth_user_id", null)
        .maybeSingle();

      if (orphanHost?.id) {
        hostId = String(orphanHost.id);
        await supabase
          .from("hosts")
          .update({
            auth_user_id: userId,
            display_name: fullName,
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

  if (input.role === "travel_agent") {
    const companyName = input.companyName?.trim() || fullName;
    const { data: existingAgent } = await supabase
      .from("travel_agents")
      .select("id")
      .eq("auth_user_id", userId)
      .maybeSingle();

    const agentPatch = {
      company_name: companyName,
      contact_name: fullName,
      email,
      phone,
      city: input.city?.trim() || null,
      address: input.address?.trim() || null,
      gst_number: input.gstNumber?.trim().toUpperCase() || null,
      pan_number: input.panNumber?.trim().toUpperCase() || null,
      gst_certificate_url: input.gstCertificateUrl?.trim() || null,
      company_registration_url: input.companyRegistrationUrl?.trim() || null,
      passport_photo_url: input.passportPhotoUrl?.trim() || null,
      discount_percent: input.discountPercent ?? 0,
      verified: true,
      approval_status: "approved",
    };

    if (existingAgent?.id) {
      travelAgentId = String(existingAgent.id);
      await supabase.from("travel_agents").update(agentPatch).eq("id", travelAgentId);
    } else {
      const { data: agentRow, error: agentError } = await supabase
        .from("travel_agents")
        .insert({
          auth_user_id: userId,
          ...agentPatch,
        })
        .select("id")
        .single();
      if (agentError || !agentRow) {
        throw new Error(agentError?.message ?? "Failed to create travel agent profile.");
      }
      travelAgentId = String(agentRow.id);
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
  if (travelAgentId) profilePatch.travel_agent_id = travelAgentId;

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
      ...(travelAgentId ? { travel_agent_id: travelAgentId } : {}),
    })
    .eq("id", userId);

  const { data: existingRoles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = new Set((existingRoles ?? []).map((r) => String(r.role)));
  roles.add(input.role);
  if (roles.has("guest") && (input.role === "host" || input.role === "homestay_owner" || input.role === "travel_agent")) {
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

  const emailResult = await sendTemporaryPasswordEmail({
    email,
    fullName,
    role: input.role,
    temporaryPassword,
  });

  return {
    userId,
    hostId,
    homestayOwnerId,
    travelAgentId,
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
