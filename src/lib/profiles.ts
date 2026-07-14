import type { SupabaseClient } from "@supabase/supabase-js";
import { isUserRole, pickPrimaryRole, resolveUserRoles, type UserRole } from "@/lib/roles";

export type UserProfile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  roles: UserRole[];
  hostId: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  host_id: string | null;
};

async function fetchRoleRows(supabase: SupabaseClient, userId: string): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error || !data?.length) return [];
  return data
    .map((row) => row.role)
    .filter((role): role is UserRole => isUserRole(role));
}

function mapProfile(row: ProfileRow, roles: UserRole[]): UserProfile {
  const fallbackRole = isUserRole(row.role) ? row.role : "guest";
  const resolvedRoles = resolveUserRoles(roles, fallbackRole);
  const primaryRole = pickPrimaryRole(resolvedRoles, fallbackRole) ?? fallbackRole;
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    role: primaryRole,
    roles: resolvedRoles,
    hostId: row.host_id,
  };
}

export async function fetchUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, host_id")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  const roles = await fetchRoleRows(supabase, userId);
  return mapProfile(data as ProfileRow, roles);
}

/** Self-registration always creates a guest profile. Host/admin accounts are created by admin. */
export async function ensureGuestProfile(
  supabase: SupabaseClient,
  userId: string,
  options: { fullName?: string; phone?: string },
): Promise<UserProfile | null> {
  const existing = await fetchUserProfile(supabase, userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      full_name: options.fullName?.trim() || null,
      phone: options.phone?.trim() || null,
      role: "guest",
    })
    .select("id, full_name, phone, role, host_id")
    .single();

  if (error) {
    // Profile may already exist from the auth trigger / admin provisioning.
    return fetchUserProfile(supabase, userId);
  }
  if (!data) return null;

  const { error: roleError } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role: "guest" });
  if (roleError) {
    // Admin may already have assigned staff roles — reload rather than forcing guest.
    return fetchUserProfile(supabase, userId);
  }

  return mapProfile(data as ProfileRow, ["guest"]);
}
