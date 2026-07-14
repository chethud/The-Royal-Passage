/**
 * Convert existing Supabase storage photos to WebP and rewrite stored URLs.
 *
 * Usage:
 *   node --env-file=.env.local --env-file=.env scripts/convert-storage-photos-to-webp.mjs
 *
 * Optional dry run:
 *   DRY_RUN=1 node --env-file=.env.local --env-file=.env scripts/convert-storage-photos-to-webp.mjs
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "experience-photos";
const MAX_EDGE = 2400;
const WEBP_QUALITY = 82;
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

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

function publicUrlFor(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function toWebpPath(path) {
  return path.replace(/\.(jpe?g|png|gif|avif|heic)$/i, ".webp");
}

function isRasterForConvert(path) {
  return /\.(jpe?g|png|avif|heic)$/i.test(path);
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
      // Folders have id null and no metadata size in some responses
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
  if (!isRasterForConvert(path)) {
    return { skipped: true, reason: "not a convertible raster" };
  }

  const nextPath = toWebpPath(path);
  const oldUrl = publicUrlFor(path);
  const newUrl = publicUrlFor(nextPath);

  const { data: blob, error: downloadError } = await supabase.storage.from(BUCKET).download(path);
  if (downloadError) throw downloadError;

  const input = Buffer.from(await blob.arrayBuffer());
  const image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const longest = Math.max(width, height);

  let pipeline = image;
  if (longest > MAX_EDGE && longest > 0) {
    pipeline = pipeline.resize({
      width: width >= height ? MAX_EDGE : undefined,
      height: height > width ? MAX_EDGE : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const webpBytes = await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toBuffer();

  if (DRY_RUN) {
    return {
      skipped: false,
      dryRun: true,
      path,
      nextPath,
      oldUrl,
      newUrl,
      bytes: webpBytes.byteLength,
    };
  }

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(nextPath, webpBytes, {
    contentType: "image/webp",
    cacheControl: "3600",
    upsert: true,
  });
  if (uploadError) throw uploadError;

  // Best-effort remove original (keep if remove fails).
  await supabase.storage.from(BUCKET).remove([path]);

  return { skipped: false, path, nextPath, oldUrl, newUrl, bytes: webpBytes.byteLength };
}

function replaceUrlDeep(value, replacements) {
  if (typeof value === "string") {
    let next = value;
    for (const [from, to] of replacements) {
      if (next.includes(from)) next = next.split(from).join(to);
    }
    return next;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceUrlDeep(item, replacements));
  }
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
    if (DRY_RUN) {
      updated += 1;
      continue;
    }
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
    if (DRY_RUN) {
      updated += 1;
      continue;
    }
    const { error: updateError } = await supabase
      .from("platform_settings")
      .update({ value: next })
      .eq("key", row.key);
    if (updateError) {
      console.warn(`  failed platform_settings ${row.key}: ${updateError.message}`);
      continue;
    }
    updated += 1;
  }

  if (!DRY_RUN && updated > 0) {
    const versionKey = "homepage_content_version";
    const { data: versionRow } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", versionKey)
      .maybeSingle();
    const current =
      typeof versionRow?.value === "number"
        ? versionRow.value
        : Number(versionRow?.value) || 1;
    await supabase.from("platform_settings").upsert({
      key: versionKey,
      value: current + 1,
    });
  }

  return updated;
}

async function main() {
  console.log(DRY_RUN ? "DRY RUN — no writes" : "Converting storage photos to WebP…");
  const objects = await listAllObjects();
  console.log(`Found ${objects.length} objects in ${BUCKET}`);

  const replacements = [];
  let converted = 0;
  let skipped = 0;

  for (const path of objects) {
    try {
      const result = await convertObject(path);
      if (result.skipped) {
        skipped += 1;
        continue;
      }
      converted += 1;
      replacements.push([result.oldUrl, result.newUrl]);
      console.log(
        `  ${result.dryRun ? "[dry] " : ""}${path} → ${result.nextPath} (${result.bytes} bytes)`,
      );
    } catch (err) {
      console.warn(`  failed ${path}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`Converted ${converted}, skipped ${skipped}`);
  if (replacements.length === 0) {
    console.log("No URL rewrites needed.");
    return;
  }

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

  console.log(`Updated ${counts.reduce((a, b) => a + b, 0)} records${DRY_RUN ? " (dry run)" : ""}.`);
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
