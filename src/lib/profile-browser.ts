import type { GuestProfile, UpdateGuestProfilePayload } from "@/lib/api/guest";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  avatar_url: string | null;
  date_of_birth: string | null;
  vip_membership_status: string | null;
  registration_number: string | null;
};

const PROFILE_SELECT =
  "id, full_name, phone, role, created_at, avatar_url, date_of_birth, vip_membership_status, registration_number";

function mapProfileRow(row: ProfileRow, email: string | null): GuestProfile {
  return {
    id: row.id,
    email,
    fullName: row.full_name,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at,
    avatarUrl: row.avatar_url,
    dateOfBirth: row.date_of_birth,
    vipMembershipStatus: row.vip_membership_status ?? "none",
    registrationNumber: row.registration_number,
  };
}

export async function fetchAccountProfile(): Promise<GuestProfile> {
  const supabase = getSupabaseBrowser();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Sign in to view your profile.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Profile not found.");
  }

  return mapProfileRow(data as ProfileRow, user.email ?? null);
}

export async function updateAccountProfile(payload: UpdateGuestProfilePayload): Promise<GuestProfile> {
  const supabase = getSupabaseBrowser();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Sign in to update your profile.");
  }

  const updates: Record<string, string | null> = {};
  if (payload.fullName !== undefined) {
    updates.full_name = payload.fullName.trim() || null;
  }
  if (payload.phone !== undefined) {
    updates.phone = payload.phone.trim() || null;
  }
  if (payload.avatarUrl !== undefined) {
    const url = payload.avatarUrl.trim();
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      throw new Error("Profile photo must be a valid image URL.");
    }
    updates.avatar_url = url || null;
  }
  if (payload.dateOfBirth !== undefined) {
    const dob = payload.dateOfBirth.trim();
    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      throw new Error("Date of birth must use YYYY-MM-DD format.");
    }
    updates.date_of_birth = dob || null;
  }

  if (Object.keys(updates).length === 0) {
    return fetchAccountProfile();
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select(PROFILE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfileRow(data as ProfileRow, user.email ?? null);
}
