/**
 * Creates (or updates) the platform admin login in Supabase.
 *
 * Usage:
 *   1. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   2. npm run setup:admin
 *
 * Default credentials:
 *   Email:    Admin@gmail.com
 *   Password: Admin@123
 */

import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "Admin@gmail.com";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME = "Platform Admin";

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing VITE_SUPABASE_URL (or SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserByEmail(email) {
  let page = 1;
  const target = email.toLowerCase();

  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === target);
    if (match) return match;

    if (data.users.length < 200) break;
    page += 1;
  }

  return null;
}

async function ensureAdminProfile(userId) {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: ADMIN_NAME,
    role: "admin",
  });

  if (error) throw error;
}

async function main() {
  const existing = await findUserByEmail(ADMIN_EMAIL);

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_NAME },
    });
    if (error) throw error;

    await ensureAdminProfile(data.user.id);
    console.log(`Updated admin: ${ADMIN_EMAIL}`);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: ADMIN_NAME },
  });
  if (error) throw error;

  await ensureAdminProfile(data.user.id);
  console.log(`Created admin: ${ADMIN_EMAIL}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
