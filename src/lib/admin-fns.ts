import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isApiConfigured } from "@/lib/api/client";
import { createHost, fetchManagedUsers, type ManagedUser } from "@/lib/api/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/roles";

export type { ManagedUser };

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
