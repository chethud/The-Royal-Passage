import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isApiConfigured } from "@/lib/api/client";
import {
  createHost,
  fetchManagedUsers,
  fetchPendingExperiences,
  publishExperience,
  rejectExperience,
  fetchAdminActivity,
  fetchAdminBookings,
  fetchAdminStats,
  type AdminBookingRow,
  type AdminExperienceSummary,
  type AdminStats,
  type AuditLogEntry,
  type ManagedUser,
} from "@/lib/api/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/roles";

export type {
  AdminBookingRow,
  AdminExperienceSummary,
  AdminStats,
  AuditLogEntry,
  ManagedUser,
};

export type EscalationRoleScope = "host" | "homestay_owner" | "vip_owner";

export type EscalationDirectoryMember = {
  id: string;
  memberName: string;
  memberEmail: string;
  memberMobile: string;
  designation: string;
  sortOrder: number;
};

export type EscalationDirectoryEntry = {
  profileId: string;
  roleScope: EscalationRoleScope;
  ownerName: string;
  ownerEmail: string | null;
  ownerPhone: string | null;
  listingNames: string[];
  members: EscalationDirectoryMember[];
};

export type EscalationDirectory = {
  host: EscalationDirectoryEntry[];
  homestay_owner: EscalationDirectoryEntry[];
  vip_owner: EscalationDirectoryEntry[];
};

async function requireAdmin(accessToken: string) {
  const supabase = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("You must be signed in as an admin.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    throw new Error("Only admins can perform this action.");
  }

  return user;
}

export const listManagedUsers = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string().min(1) }))
  .handler(async ({ data }): Promise<ManagedUser[]> => {
    if (isApiConfigured()) {
      return fetchManagedUsers(data.accessToken);
    }

    await requireAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role, host_id, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const {
      data: { users },
      error: usersError,
    } = await supabase.auth.admin.listUsers({ perPage: 1000 });

    if (usersError) throw new Error(usersError.message);

    const emailById = new Map(users.map((u) => [u.id, u.email ?? null]));

    return (profiles ?? []).map((row) => ({
      id: row.id,
      email: emailById.get(row.id) ?? null,
      fullName: row.full_name,
      phone: row.phone,
      role: row.role as UserRole,
      hostId: row.host_id,
      createdAt: row.created_at,
    }));
  });

const createHostSchema = z.object({
  accessToken: z.string().min(1),
  displayName: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  phone: z.string().max(30).optional(),
  bio: z.string().max(500).optional(),
});

export const createHostAccount = createServerFn({ method: "POST" })
  .inputValidator(createHostSchema)
  .handler(async ({ data }) => {
    if (isApiConfigured()) {
      return createHost(data.accessToken, {
        displayName: data.displayName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        bio: data.bio,
      });
    }

    await requireAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.displayName,
        phone: data.phone ?? null,
      },
    });

    if (createError || !created.user) {
      throw new Error(createError?.message ?? "Failed to create host login.");
    }

    const userId = created.user.id;

    const { data: hostRow, error: hostError } = await supabase
      .from("hosts")
      .insert({
        auth_user_id: userId,
        display_name: data.displayName,
        email: data.email,
        phone: data.phone ?? null,
        bio: data.bio ?? null,
        verified: false,
        approval_status: "pending",
      })
      .select("id")
      .single();

    if (hostError || !hostRow) {
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(hostError?.message ?? "Failed to create host profile.");
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: data.displayName,
      phone: data.phone ?? null,
      role: "host",
      host_id: hostRow.id,
    });

    if (profileError) {
      await supabase.from("hosts").delete().eq("id", hostRow.id);
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(profileError.message);
    }

    return {
      id: userId,
      email: data.email,
      displayName: data.displayName,
      hostId: hostRow.id,
    };
  });

export const listPendingExperiences = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string().min(1) }))
  .handler(async ({ data }): Promise<AdminExperienceSummary[]> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchPendingExperiences(data.accessToken);
  });

export const approveExperience = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ accessToken: z.string().min(1), experienceId: z.string().min(1) }),
  )
  .handler(async ({ data }): Promise<AdminExperienceSummary> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return publishExperience(data.accessToken, data.experienceId);
  });

export const getAdminStats = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string().min(1) }))
  .handler(async ({ data }): Promise<AdminStats> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchAdminStats(data.accessToken);
  });

export const listAdminBookings = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string().min(1) }))
  .handler(async ({ data }): Promise<AdminBookingRow[]> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchAdminBookings(data.accessToken);
  });

export const listAdminActivity = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string().min(1) }))
  .handler(async ({ data }): Promise<AuditLogEntry[]> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchAdminActivity(data.accessToken);
  });

export const listEscalationDirectory = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string().min(1) }))
  .handler(async ({ data }): Promise<EscalationDirectory> => {
    await requireAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();

    const [profilesRes, contactsRes, hostsRes, homestayOwnersRes, homestaysRes, vipOwnersRes] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, phone, host_id, homestay_owner_id, vip_owner_id")
          .order("created_at", { ascending: false }),
        supabase
          .from("escalation_contacts")
          .select(
            "id, profile_id, role_scope, member_name, member_email, member_mobile, designation, sort_order",
          )
          .order("sort_order", { ascending: true }),
        supabase.from("hosts").select("id, display_name, email, phone"),
        supabase.from("homestay_owners").select("id, full_name, email, phone"),
        supabase.from("homestays").select("owner_id, title"),
        supabase.from("vip_owners").select("id, full_name, email, phone"),
      ]);

    const error =
      profilesRes.error ||
      contactsRes.error ||
      hostsRes.error ||
      homestayOwnersRes.error ||
      homestaysRes.error ||
      vipOwnersRes.error;
    if (error) throw new Error(error.message);

    const profiles = (profilesRes.data ?? []) as Array<{
      id: string;
      full_name: string | null;
      phone: string | null;
      host_id: string | null;
      homestay_owner_id: string | null;
      vip_owner_id: string | null;
    }>;
    const contacts = (contactsRes.data ?? []) as Array<{
      id: string;
      profile_id: string;
      role_scope: EscalationRoleScope;
      member_name: string;
      member_email: string;
      member_mobile: string;
      designation: string;
      sort_order: number;
    }>;
    const hosts = (hostsRes.data ?? []) as Array<{
      id: string;
      display_name: string;
      email: string | null;
      phone: string | null;
    }>;
    const homestayOwners = (homestayOwnersRes.data ?? []) as Array<{
      id: string;
      full_name: string;
      email: string;
      phone: string | null;
    }>;
    const homestays = (homestaysRes.data ?? []) as Array<{ owner_id: string; title: string }>;
    const vipOwners = (vipOwnersRes.data ?? []) as Array<{
      id: string;
      full_name: string;
      email: string;
      phone: string | null;
    }>;

    const contactsByKey = new Map<string, EscalationDirectoryMember[]>();
    for (const contact of contacts) {
      const key = `${contact.profile_id}:${contact.role_scope}`;
      const list = contactsByKey.get(key) ?? [];
      list.push({
        id: contact.id,
        memberName: contact.member_name,
        memberEmail: contact.member_email,
        memberMobile: contact.member_mobile,
        designation: contact.designation,
        sortOrder: contact.sort_order,
      });
      contactsByKey.set(key, list);
    }

    const hostById = new Map(hosts.map((row) => [row.id, row]));
    const homestayOwnerById = new Map(homestayOwners.map((row) => [row.id, row]));
    const vipOwnerById = new Map(vipOwners.map((row) => [row.id, row]));
    const homestayNamesByOwnerId = new Map<string, string[]>();
    for (const stay of homestays) {
      const list = homestayNamesByOwnerId.get(stay.owner_id) ?? [];
      list.push(stay.title);
      homestayNamesByOwnerId.set(stay.owner_id, list);
    }

    const result: EscalationDirectory = {
      host: [],
      homestay_owner: [],
      vip_owner: [],
    };

    for (const profile of profiles) {
      if (profile.host_id) {
        const owner = hostById.get(profile.host_id);
        result.host.push({
          profileId: profile.id,
          roleScope: "host",
          ownerName: owner?.display_name ?? profile.full_name ?? "Host",
          ownerEmail: owner?.email ?? null,
          ownerPhone: owner?.phone ?? profile.phone ?? null,
          listingNames: [],
          members: contactsByKey.get(`${profile.id}:host`) ?? [],
        });
      }
      if (profile.homestay_owner_id) {
        const owner = homestayOwnerById.get(profile.homestay_owner_id);
        result.homestay_owner.push({
          profileId: profile.id,
          roleScope: "homestay_owner",
          ownerName: owner?.full_name ?? profile.full_name ?? "Homestay owner",
          ownerEmail: owner?.email ?? null,
          ownerPhone: owner?.phone ?? profile.phone ?? null,
          listingNames: homestayNamesByOwnerId.get(profile.homestay_owner_id) ?? [],
          members: contactsByKey.get(`${profile.id}:homestay_owner`) ?? [],
        });
      }
      if (profile.vip_owner_id) {
        const owner = vipOwnerById.get(profile.vip_owner_id);
        result.vip_owner.push({
          profileId: profile.id,
          roleScope: "vip_owner",
          ownerName: owner?.full_name ?? profile.full_name ?? "VIP owner",
          ownerEmail: owner?.email ?? null,
          ownerPhone: owner?.phone ?? profile.phone ?? null,
          listingNames: [],
          members: contactsByKey.get(`${profile.id}:vip_owner`) ?? [],
        });
      }
    }

    return result;
  });

export const rejectExperienceFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ accessToken: z.string().min(1), experienceId: z.string().min(1) }),
  )
  .handler(async ({ data }): Promise<AdminExperienceSummary> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return rejectExperience(data.accessToken, data.experienceId);
  });
