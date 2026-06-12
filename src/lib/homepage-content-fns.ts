import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  HOMEPAGE_JOURNAL_KEY,
  HOMEPAGE_SHOWCASE_KEY,
  normalizeHomepageContent,
  type HomepageContent,
  type HomepageJournalItem,
  type HomepageShowcaseItem,
} from "@/lib/homepage-content";
import {
  EXPERIENCE_PHOTOS_BUCKET,
  MAX_EXPERIENCE_PHOTO_BYTES,
} from "@/lib/experience-photo-upload";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/env.server";

const ALLOWED_HOMEPAGE_PHOTO_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function extensionForMime(mimeType: string, fileName: string): string {
  const fromName = fileName.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}

function decodeBase64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const showcaseIconKeySchema = z.enum(["pottery", "flame", "heritage"]);

const showcaseItemSchema = z.object({
  id: z.string().min(1),
  iconKey: showcaseIconKeySchema,
  title: z.string().min(1).max(120),
  imageUrl: z.string().min(1),
  alt: z.string().min(1).max(200),
  href: z.string().min(1).max(200),
});

const journalItemSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().min(1),
  alt: z.string().min(1).max(200),
  title: z.string().min(1).max(120),
  excerpt: z.string().min(1).max(400),
});

async function requireEditor(accessToken: string) {
  const supabase = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("You must be signed in as an editor.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "editor") {
    throw new Error("Only editors can perform this action.");
  }

  return user;
}

async function loadHomepageContentFromDb(): Promise<HomepageContent> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_HOMEPAGE_CONTENT;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("platform_settings")
    .select("key, value")
    .in("key", [HOMEPAGE_SHOWCASE_KEY, HOMEPAGE_JOURNAL_KEY]);

  if (error) {
    return DEFAULT_HOMEPAGE_CONTENT;
  }

  const byKey = new Map((data ?? []).map((row) => [row.key, row.value]));
  return normalizeHomepageContent({
    showcase: byKey.get(HOMEPAGE_SHOWCASE_KEY),
    journal: byKey.get(HOMEPAGE_JOURNAL_KEY),
  });
}

export const getHomepageContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomepageContent> => loadHomepageContentFromDb(),
);

export const saveHomepageShowcase = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      items: z.array(showcaseItemSchema).length(3),
    }),
  )
  .handler(async ({ data }): Promise<HomepageShowcaseItem[]> => {
    await requireEditor(data.accessToken);
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("platform_settings").upsert(
      {
        key: HOMEPAGE_SHOWCASE_KEY,
        value: data.items,
      },
      { onConflict: "key" },
    );

    if (error) throw new Error(error.message);
    return data.items;
  });

export const saveHomepageJournal = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      items: z.array(journalItemSchema).length(3),
    }),
  )
  .handler(async ({ data }): Promise<HomepageJournalItem[]> => {
    await requireEditor(data.accessToken);
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("platform_settings").upsert(
      {
        key: HOMEPAGE_JOURNAL_KEY,
        value: data.items,
      },
      { onConflict: "key" },
    );

    if (error) throw new Error(error.message);
    return data.items;
  });

export const uploadHomepagePhoto = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      fileName: z.string().min(1).max(200),
      mimeType: z.string().min(1),
      base64: z.string().min(1),
    }),
  )
  .handler(async ({ data }): Promise<{ publicUrl: string }> => {
    const user = await requireEditor(data.accessToken);

    if (!ALLOWED_HOMEPAGE_PHOTO_MIME.has(data.mimeType)) {
      throw new Error("Use a JPEG, PNG, WebP, or GIF image.");
    }

    const bytes = decodeBase64ToBytes(data.base64);
    if (bytes.byteLength > MAX_EXPERIENCE_PHOTO_BYTES) {
      throw new Error("Image must be 5 MB or smaller.");
    }

    const supabase = getSupabaseAdmin();
    const ext = extensionForMime(data.mimeType, data.fileName);
    const path = `homepage/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const { error } = await supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).upload(path, bytes, {
      cacheControl: "3600",
      upsert: false,
      contentType: data.mimeType,
    });

    if (error) throw new Error(error.message);

    const { data: publicData } = supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).getPublicUrl(path);
    return { publicUrl: publicData.publicUrl };
  });
