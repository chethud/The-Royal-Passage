import {
  DEFAULT_HOMEPAGE_CONTENT,
  normalizeHomepageContent as normalizeHomepageContentForUi,
} from "@/lib/homepage-content";
import {
  HOMEPAGE_HERO_HEADINGS_KEY,
  HOMEPAGE_HERO_KEY,
  HOMEPAGE_JOURNAL_KEY,
  HOMEPAGE_JOURNEYS_KEY,
  HOMEPAGE_SHOWCASE_KEY,
  HOMEPAGE_VERSION_KEY,
  parseVersionValue,
  type HomepageContent,
} from "@/lib/homepage-content-keys";
import { isSupabaseReadable } from "@/lib/env.server";
import { getSupabaseServerRead } from "@/lib/supabase/admin";

export {
  applyHomepagePhotoCore,
  bumpHomepageVersion,
  commitHomepagePhotoWithUpload,
  commitHomepagePhotoWithUploadBytes,
  requireEditor,
  requireHomepageAdmin,
  requireHomepageJournalEditor,
  requireHomepagePhotoAccess,
  writePlatformSetting,
  type ApplyHomepagePhotoInput,
  type ApplyHomepagePhotoResult,
  type CommitHomepagePhotoUploadBytesInput,
  type CommitHomepagePhotoUploadInput,
} from "@/lib/homepage-photo-upload.server";

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
    .in("key", [
      HOMEPAGE_SHOWCASE_KEY,
      HOMEPAGE_JOURNAL_KEY,
      HOMEPAGE_HERO_KEY,
      HOMEPAGE_HERO_HEADINGS_KEY,
      HOMEPAGE_JOURNEYS_KEY,
      HOMEPAGE_VERSION_KEY,
    ]);

  if (error) {
    throw new Error(error.message);
  }

  const byKey = new Map((data ?? []).map((row) => [row.key, row.value]));
  if (
    !byKey.has(HOMEPAGE_SHOWCASE_KEY) &&
    !byKey.has(HOMEPAGE_JOURNAL_KEY) &&
    !byKey.has(HOMEPAGE_HERO_KEY) &&
    !byKey.has(HOMEPAGE_HERO_HEADINGS_KEY) &&
    !byKey.has(HOMEPAGE_JOURNEYS_KEY)
  ) {
    return DEFAULT_HOMEPAGE_CONTENT;
  }

  return normalizeHomepageContentForUi({
    showcase: byKey.get(HOMEPAGE_SHOWCASE_KEY),
    journal: byKey.get(HOMEPAGE_JOURNAL_KEY),
    hero: byKey.get(HOMEPAGE_HERO_KEY),
    heroHeadings: byKey.get(HOMEPAGE_HERO_HEADINGS_KEY),
    journeys: byKey.get(HOMEPAGE_JOURNEYS_KEY),
    version: parseVersionValue(byKey.get(HOMEPAGE_VERSION_KEY)),
  });
}
