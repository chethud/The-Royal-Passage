import { deleteServerCache } from "@/lib/cache.server";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  HOMEPAGE_CACHE_KEY,
  HOMEPAGE_JOURNAL_KEY,
  HOMEPAGE_SHOWCASE_KEY,
  HOMEPAGE_VERSION_KEY,
  normalizeHomepageContent,
  parseVersionValue,
  type HomepageContent,
} from "@/lib/homepage-content";
import { isSupabaseConfigured, isSupabaseReadable } from "@/lib/env.server";
import { getSupabaseAdmin, getSupabaseServerRead } from "@/lib/supabase/admin";

export type ApplyHomepagePhotoInput = {
  accessToken: string;
  section: "showcase" | "journal";
  itemIndex: number;
  publicUrl: string;
};

export type ApplyHomepagePhotoResult = {
  publicUrl: string;
  version: number;
};

function toJsonb(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

export async function requireEditor(accessToken: string) {
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

function invalidateHomepageCache() {
  deleteServerCache(HOMEPAGE_CACHE_KEY);
}

export async function writePlatformSetting(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  key: string,
  value: unknown,
) {
  const { error } = await supabase.from("platform_settings").upsert(
    {
      key,
      value: toJsonb(value),
    },
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);
}

export async function bumpHomepageVersion(
  supabase: ReturnType<typeof getSupabaseAdmin>,
): Promise<number> {
  const version = Date.now();
  await writePlatformSetting(supabase, HOMEPAGE_VERSION_KEY, { updatedAt: version });
  invalidateHomepageCache();
  return version;
}

async function loadHomepageContentFromDb(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("key, value")
    .in("key", [HOMEPAGE_SHOWCASE_KEY, HOMEPAGE_JOURNAL_KEY, HOMEPAGE_VERSION_KEY]);

  if (error) {
    throw new Error(error.message);
  }

  const byKey = new Map((data ?? []).map((row) => [row.key, row.value]));
  return normalizeHomepageContent({
    showcase: byKey.get(HOMEPAGE_SHOWCASE_KEY),
    journal: byKey.get(HOMEPAGE_JOURNAL_KEY),
    version: parseVersionValue(byKey.get(HOMEPAGE_VERSION_KEY)),
  });
}

export async function fetchHomepageContentFromDb(): Promise<HomepageContent> {
  if (!isSupabaseReadable()) {
    return DEFAULT_HOMEPAGE_CONTENT;
  }

  const supabase = getSupabaseServerRead();
  if (!supabase) {
    return DEFAULT_HOMEPAGE_CONTENT;
  }

  const { data, error } = await supabase
    .from("platform_settings")
    .select("key, value")
    .in("key", [HOMEPAGE_SHOWCASE_KEY, HOMEPAGE_JOURNAL_KEY, HOMEPAGE_VERSION_KEY]);

  if (error) {
    throw new Error(error.message);
  }

  const byKey = new Map((data ?? []).map((row) => [row.key, row.value]));
  return normalizeHomepageContent({
    showcase: byKey.get(HOMEPAGE_SHOWCASE_KEY),
    journal: byKey.get(HOMEPAGE_JOURNAL_KEY),
    version: parseVersionValue(byKey.get(HOMEPAGE_VERSION_KEY)),
  });
}

export async function applyHomepagePhotoCore(
  input: ApplyHomepagePhotoInput,
): Promise<ApplyHomepagePhotoResult> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Homepage save is not configured on the server. Set SUPABASE_SERVICE_ROLE_KEY in your hosting environment (e.g. Vercel).",
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(input.publicUrl);
  } catch {
    throw new Error("Uploaded photo URL is invalid.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("Uploaded photo URL must be public http(s).");
  }

  await requireEditor(input.accessToken);
  const supabase = getSupabaseAdmin();
  const current = await loadHomepageContentFromDb(supabase);
  const publicUrl = input.publicUrl.trim();

  if (input.section === "showcase") {
    const items = current.showcase.map((item, index) =>
      index === input.itemIndex ? { ...item, imageUrl: publicUrl } : item,
    );
    await writePlatformSetting(supabase, HOMEPAGE_SHOWCASE_KEY, items);
  } else {
    const items = current.journal.map((item, index) =>
      index === input.itemIndex ? { ...item, imageUrl: publicUrl } : item,
    );
    await writePlatformSetting(supabase, HOMEPAGE_JOURNAL_KEY, items);
  }

  const version = await bumpHomepageVersion(supabase);
  return { publicUrl, version };
}
