/**
 * Creates (or updates) the homepage editor login in Supabase.
 *
 * Usage:
 *   1. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 *   2. npm run setup:editor
 *
 * Default credentials:
 *   Email:    edit@gmail.com
 *   Password: Edit@123
 */

import { createClient } from "@supabase/supabase-js";

const EDITOR_EMAIL = "edit@gmail.com";
const EDITOR_PASSWORD = "Edit@123";
const EDITOR_NAME = "Homepage Editor";

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing VITE_SUPABASE_URL (or SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY.",
  );
  console.error(
    "Add them to .env.local (Supabase Dashboard → Project Settings → API → service_role key).",
  );
  console.error("Then run: npm run setup:editor");
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

async function ensureEditorProfile(userId) {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: EDITOR_NAME,
    role: "editor",
  });

  if (error) throw error;
}

async function main() {
  const existing = await findUserByEmail(EDITOR_EMAIL);

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: EDITOR_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: EDITOR_NAME },
    });
    if (error) throw error;

    await ensureEditorProfile(data.user.id);
    console.log(`Updated editor: ${EDITOR_EMAIL}`);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: EDITOR_EMAIL,
    password: EDITOR_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: EDITOR_NAME },
  });
  if (error) throw error;

  await ensureEditorProfile(data.user.id);
  console.log(`Created editor: ${EDITOR_EMAIL}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
