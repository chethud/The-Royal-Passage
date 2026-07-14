/**
 * Convert existing Supabase storage .webp photos back to JPEG and rewrite URLs.
 *
 * Usage:
 *   node --env-file=.env --env-file=.env.local scripts/convert-storage-webp-to-jpeg.mjs
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "experience-photos";
const JPEG_QUALITY = 90;
const MAX_EDGE = 2400;

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL (or SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function publicUrlFor(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function toJpegPath(path) {
  return path.replace(/\.webp$/i, ".jpg");
}

async function listAllObjects(prefix = "") {
  const out = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!data?.length) break;

    for (const item of data) {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id == null && !item.metadata) {
        out.push(...(await listAllObjects(fullPath)));
      } else if (item.name && !item.name.endsWith("/")) {
        out.push(fullPath);
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return out;
}

async function convertObject(path) {
  if (!/\.webp$/i.test(path)) {
    return { skipped: true };
  }

  const nextPath = toJpegPath(path);
  const oldUrl = publicUrlFor(path);
  const newUrl = publicUrlFor(nextPath);

  const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(path);
  if (downloadError) throw downloadError;

  const input = Buffer.from(await blob.arrayBuffer());
  let pipeline = sharp(input, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const longest = Math.max(width, height);

  if (longest > MAX_EDGE && longest > 0) {
    pipeline = pipeline.resize({
      width: width >= height ? MAX_EDGE : undefined,
      height: height > width ? MAX_EDGE : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const jpegBytes = await pipeline
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(nextPath, jpegBytes, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
    upsert: true,
  });
  if (uploadError) throw uploadError;

  await supabase.storage.from(BUCKET).remove([path]);

  return { skipped: false, path, nextPath, oldUrl, newUrl, bytes: jpegBytes.byteLength };
}

function replaceUrlDeep(value, replacements) {
  if (typeof value === "string") {
    let next = value;
    for (const [from, to] of replacements) {
      if (next.includes(from)) next = next.split(from).join(to);
    }
    // Also fix any leftover .webp storage URLs generically
    next = next.replace(
      /(\/storage\/v1\/object\/public\/experience-photos\/[^\s"'\\]+)\.webp/gi,
      "$1.jpg",
    );
    return next;
  }
  if (Array.isArray(value)) return value.map((item) => replaceUrlDeep(item, replacements));
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = replaceUrlDeep(child, replacements);
    }
    return out;
  }
  return value;
}

async function rewriteTableColumn(table, column, replacements) {
  const { data, error } = await supabase.from(table).select(`id, ${column}`);
  if (error) {
    console.warn(`  skip ${table}.${column}: ${error.message}`);
    return 0;
  }

  let updated = 0;
  for (const row of data ?? []) {
    const current = row[column];
    if (current == null) continue;
    const next = replaceUrlDeep(current, replacements);
    if (JSON.stringify(next) === JSON.stringify(current)) continue;
    const { error: updateError } = await supabase
      .from(table)
      .update({ [column]: next })
      .eq("id", row.id);
    if (updateError) {
      console.warn(`  failed ${table} ${row.id}: ${updateError.message}`);
      continue;
    }
    updated += 1;
  }
  return updated;
}

async function rewritePlatformSettings(replacements) {
  const { data, error } = await supabase.from("platform_settings").select("key, value");
  if (error) {
    console.warn(`  skip platform_settings: ${error.message}`);
    return 0;
  }

  let updated = 0;
  for (const row of data ?? []) {
    const next = replaceUrlDeep(row.value, replacements);
    if (JSON.stringify(next) === JSON.stringify(row.value)) continue;
    const { error: updateError } = await supabase
      .from("platform_settings")
      .update({ value: next })
      .eq("key", row.key);
    if (updateError) {
      console.warn(`  failed platform_settings ${row.key}: ${updateError.message}`);
      continue;
    }
    console.log(`  updated ${row.key}`);
    updated += 1;
  }

  if (updated > 0) {
    const { data: versionRow } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "homepage_content_version")
      .maybeSingle();
    const current =
      typeof versionRow?.value === "number"
        ? versionRow.value
        : Number(versionRow?.value) || 1;
    await supabase.from("platform_settings").upsert({
      key: "homepage_content_version",
      value: current + 1,
    });
  }

  return updated;
}

async function main() {
  console.log("Converting storage WebP photos back to JPEG…");
  const objects = await listAllObjects();
  const webps = objects.filter((path) => /\.webp$/i.test(path));
  console.log(`Found ${webps.length} WebP objects (of ${objects.length} total)`);

  const replacements = [];
  let converted = 0;

  for (const path of webps) {
    try {
      const result = await convertObject(path);
      if (result.skipped) continue;
      converted += 1;
      replacements.push([result.oldUrl, result.newUrl]);
      console.log(`  ${path} → ${result.nextPath} (${result.bytes} bytes)`);
    } catch (err) {
      console.warn(`  failed ${path}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`Converted ${converted} files`);
  console.log("Rewriting stored URLs…");

  const counts = await Promise.all([
    rewritePlatformSettings(replacements),
    rewriteTableColumn("experiences", "hero_image_url", replacements),
    rewriteTableColumn("experiences", "gallery_urls", replacements),
    rewriteTableColumn("homestays", "hero_image_url", replacements),
    rewriteTableColumn("homestays", "gallery_urls", replacements),
    rewriteTableColumn("homestays", "license_certificate_url", replacements),
    rewriteTableColumn("profiles", "avatar_url", replacements),
    rewriteTableColumn("vip_packages", "hero_image_url", replacements),
    rewriteTableColumn("vip_packages", "gallery_urls", replacements),
    rewriteTableColumn("vip_membership_applications", "id_document_photo_url", replacements),
    rewriteTableColumn(
      "vip_membership_applications",
      "professional_card_photo_url",
      replacements,
    ),
  ]);

  console.log(`Updated ${counts.reduce((a, b) => a + b, 0)} records.`);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
