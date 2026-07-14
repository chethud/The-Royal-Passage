/**
 * One-shot: rewrite leftover .jpg/.png platform_settings URLs to matching .webp
 * after storage files were already converted.
 *
 * Usage:
 *   node --env-file=.env --env-file=.env.local scripts/rewrite-platform-photo-urls-to-webp.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing Supabase URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function rewriteString(value) {
  if (typeof value !== "string") return value;
  return value.replace(
    /(\/storage\/v1\/object\/public\/experience-photos\/[^\s"'\\]+)\.(jpe?g|png)/gi,
    "$1.webp",
  );
}

function rewriteDeep(value) {
  if (typeof value === "string") return rewriteString(value);
  if (Array.isArray(value)) return value.map(rewriteDeep);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = rewriteDeep(v);
    return out;
  }
  return value;
}

const { data, error } = await supabase.from("platform_settings").select("key, value");
if (error) throw error;

let updated = 0;
for (const row of data ?? []) {
  const next = rewriteDeep(row.value);
  if (JSON.stringify(next) === JSON.stringify(row.value)) continue;
  const { error: updateError } = await supabase
    .from("platform_settings")
    .update({ value: next })
    .eq("key", row.key);
  if (updateError) {
    console.warn(`failed ${row.key}: ${updateError.message}`);
    continue;
  }
  console.log(`updated ${row.key}`);
  updated += 1;
}

if (updated > 0) {
  const { data: versionRow } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "homepage_content_version")
    .maybeSingle();
  const current =
    typeof versionRow?.value === "number" ? versionRow.value : Number(versionRow?.value) || 1;
  await supabase.from("platform_settings").upsert({
    key: "homepage_content_version",
    value: current + 1,
  });
}

console.log(`Done. Updated ${updated} settings keys.`);
