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

export type EscalationRoleScope = "host" | "homestay_owner" | "vip_owner";

export type EscalationContact = {
  id: string;
  profileId: string;
  roleScope: EscalationRoleScope;
  memberName: string;
  memberEmail: string;
  memberMobile: string;
  designation: string;
  sortOrder: number;
};

type EscalationContactRow = {
  id: string;
  profile_id: string;
  role_scope: EscalationRoleScope;
  member_name: string;
  member_email: string;
  member_mobile: string;
  designation: string;
  sort_order: number;
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

function mapEscalationContactRow(row: EscalationContactRow): EscalationContact {
  return {
    id: row.id,
    profileId: row.profile_id,
    roleScope: row.role_scope,
    memberName: row.member_name,
    memberEmail: row.member_email,
    memberMobile: row.member_mobile,
    designation: row.designation,
    sortOrder: row.sort_order,
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

export async function fetchMyEscalationContacts(
  roleScope: EscalationRoleScope,
): Promise<EscalationContact[]> {
  const supabase = getSupabaseBrowser();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Sign in to view escalation details.");
  }

  const { data, error } = await supabase
    .from("escalation_contacts")
    .select(
      "id, profile_id, role_scope, member_name, member_email, member_mobile, designation, sort_order",
    )
    .eq("profile_id", user.id)
    .eq("role_scope", roleScope)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapEscalationContactRow(row as EscalationContactRow));
}

export async function saveMyEscalationContacts(
  roleScope: EscalationRoleScope,
  contacts: Array<{
    memberName: string;
    memberEmail: string;
    memberMobile: string;
    designation: string;
  }>,
): Promise<EscalationContact[]> {
  const supabase = getSupabaseBrowser();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Sign in to update escalation details.");
  }

  const payload = contacts.map((contact, index) => ({
    profile_id: user.id,
    role_scope: roleScope,
    member_name: contact.memberName.trim(),
    member_email: contact.memberEmail.trim().toLowerCase(),
    member_mobile: contact.memberMobile.trim(),
    designation: contact.designation.trim(),
    sort_order: index,
  }));

  const { error: deleteError } = await supabase
    .from("escalation_contacts")
    .delete()
    .eq("profile_id", user.id)
    .eq("role_scope", roleScope);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { data, error } = await supabase
    .from("escalation_contacts")
    .insert(payload)
    .select(
      "id, profile_id, role_scope, member_name, member_email, member_mobile, designation, sort_order",
    )
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapEscalationContactRow(row as EscalationContactRow));
}
