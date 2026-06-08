import type { SupabaseClient } from "@supabase/supabase-js";
import { isUserRole, type UserRole } from "@/lib/roles";

export type UserProfile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  hostId: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  host_id: string | null;
};

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    role: isUserRole(row.role) ? row.role : "guest",
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
  return mapProfile(data as ProfileRow);
}

/** Creates a profile row when the Supabase trigger has not run yet (e.g. fresh local DB). */
export async function ensureUserProfile(
  supabase: SupabaseClient,
  userId: string,
  options: { intendedRole: UserRole; fullName?: string; phone?: string },
): Promise<UserProfile | null> {
  const existing = await fetchUserProfile(supabase, userId);
  if (existing) return existing;

  const role = options.intendedRole === "admin" ? "guest" : options.intendedRole;

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      full_name: options.fullName?.trim() || null,
      phone: options.phone?.trim() || null,
      role,
    })
    .select("id, full_name, phone, role, host_id")
    .single();

  if (error || !data) return null;
  return mapProfile(data as ProfileRow);
}
