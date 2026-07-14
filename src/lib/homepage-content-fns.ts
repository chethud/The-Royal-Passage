import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  applyHomepagePhotoCore,
  bumpHomepageVersion,
  fetchHomepageContentFromDb,
  requireHomepageAdmin,
  requireHomepageJournalEditor,
  writePlatformSetting,
} from "@/lib/homepage-photo.server";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  HOMEPAGE_HERO_HEADINGS_KEY,
  HOMEPAGE_HERO_KEY,
  HOMEPAGE_HOMESTAY_HERO_KEY,
  HOMEPAGE_JOURNAL_KEY,
  HOMEPAGE_JOURNEYS_KEY,
  HOMEPAGE_SHOWCASE_KEY,
  type HomepageContent,
} from "@/lib/homepage-content";
import { getSupabaseConfigError } from "@/lib/env.server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { HOMESTAY_FEATURED_KEY, HOMESTAY_FEATURED_SLOT_COUNT } from "@/lib/homestay-featured-keys";
import { invalidateHomestayCatalogCache } from "@/lib/homestay-featured-fns";
import { HOMESTAY_HERO_SLIDE_COUNT } from "@/lib/homepage-content-keys";

const showcaseIconKeySchema = z.enum(["pottery", "flame", "heritage"]);
const journeyThemeSchema = z.enum(["palace", "manuscript", "dasara"]);

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

const heroSlideSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().min(1),
  alt: z.string().min(1).max(200),
});

const heroSlideshowSchema = z.object({
  id: z.string().min(1),
  slides: z.array(heroSlideSchema).length(4),
});

const heroHeadingSchema = z.object({
  id: z.string().min(1),
  eyebrow: z.string().min(1).max(80),
  line1: z.string().min(1).max(80),
  line2: z.string().min(1).max(80),
  line3: z.string().min(1).max(80),
  body: z.string().min(1).max(500),
});

const journeySlideSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  subtitle: z.string().min(1).max(120),
  lines: z.array(z.string().min(1).max(240)).min(1).max(5),
  videoId: z.string().min(6).max(20),
  theme: journeyThemeSchema,
});

/** Load homepage CMS content from Supabase — safe to call directly from route loaders. */
export async function fetchHomepageContent(): Promise<HomepageContent> {
  try {
    return await fetchHomepageContentFromDb();
  } catch (err) {
    console.error("[homepage] Failed to load platform_settings:", err);
    return DEFAULT_HOMEPAGE_CONTENT;
  }
}

export { fetchHomepageContentFromDb };

export const getHomepageContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomepageContent> => fetchHomepageContent(),
);

export const saveHomepageShowcase = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      items: z.array(showcaseItemSchema).length(3),
    }),
  )
  .handler(async ({ data }): Promise<{ version: number }> => {
    const configError = getSupabaseConfigError();
    if (configError) {
      throw new Error(configError);
    }

    await requireHomepageJournalEditor(data.accessToken);
    const supabase = getSupabaseAdmin();
    await writePlatformSetting(supabase, HOMEPAGE_SHOWCASE_KEY, data.items);
    const version = await bumpHomepageVersion(supabase);
    return { version };
  });

export const saveHomepageJournal = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      items: z.array(journalItemSchema).length(3),
    }),
  )
  .handler(async ({ data }): Promise<{ version: number }> => {
    const configError = getSupabaseConfigError();
    if (configError) {
      throw new Error(configError);
    }

    await requireHomepageJournalEditor(data.accessToken);
    const supabase = getSupabaseAdmin();
    await writePlatformSetting(supabase, HOMEPAGE_JOURNAL_KEY, data.items);
    const version = await bumpHomepageVersion(supabase);
    return { version };
  });

export const saveHomepageHero = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      /** Three slideshow packs × 4 photos each. Pack 0 = priority/constant. */
      items: z.array(heroSlideshowSchema).length(3),
    }),
  )
  .handler(async ({ data }): Promise<{ version: number }> => {
    const configError = getSupabaseConfigError();
    if (configError) {
      throw new Error(configError);
    }

    await requireHomepageJournalEditor(data.accessToken);
    const supabase = getSupabaseAdmin();
    await writePlatformSetting(supabase, HOMEPAGE_HERO_KEY, data.items);
    const version = await bumpHomepageVersion(supabase);
    return { version };
  });

export const saveHomepageHeroHeadings = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      items: z.array(heroHeadingSchema).length(3),
    }),
  )
  .handler(async ({ data }): Promise<{ version: number }> => {
    const configError = getSupabaseConfigError();
    if (configError) {
      throw new Error(configError);
    }

    await requireHomepageJournalEditor(data.accessToken);
    const supabase = getSupabaseAdmin();
    await writePlatformSetting(supabase, HOMEPAGE_HERO_HEADINGS_KEY, data.items);
    const version = await bumpHomepageVersion(supabase);
    return { version };
  });

export const saveHomepageHomestayHero = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      items: z.array(heroSlideSchema).length(HOMESTAY_HERO_SLIDE_COUNT),
    }),
  )
  .handler(async ({ data }): Promise<{ version: number }> => {
    const configError = getSupabaseConfigError();
    if (configError) {
      throw new Error(configError);
    }

    await requireHomepageJournalEditor(data.accessToken);
    const supabase = getSupabaseAdmin();
    await writePlatformSetting(supabase, HOMEPAGE_HOMESTAY_HERO_KEY, data.items);
    const version = await bumpHomepageVersion(supabase);
    return { version };
  });

export const saveHomepageJourneys = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      items: z.array(journeySlideSchema).length(3),
    }),
  )
  .handler(async ({ data }): Promise<{ version: number }> => {
    const configError = getSupabaseConfigError();
    if (configError) {
      throw new Error(configError);
    }

    await requireHomepageJournalEditor(data.accessToken);
    const supabase = getSupabaseAdmin();
    await writePlatformSetting(supabase, HOMEPAGE_JOURNEYS_KEY, data.items);
    const version = await bumpHomepageVersion(supabase);
    return { version };
  });

export const saveFeaturedHomestays = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      slugs: z.array(z.string().min(1)).length(HOMESTAY_FEATURED_SLOT_COUNT),
    }),
  )
  .handler(async ({ data }): Promise<{ slugs: string[] }> => {
    const configError = getSupabaseConfigError();
    if (configError) {
      throw new Error(configError);
    }

    if (new Set(data.slugs).size !== HOMESTAY_FEATURED_SLOT_COUNT) {
      throw new Error("Each featured slot must be a different homestay.");
    }

    await requireHomepageAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();
    await writePlatformSetting(supabase, HOMESTAY_FEATURED_KEY, data.slugs);
    invalidateHomestayCatalogCache();
    return { slugs: data.slugs };
  });

export const applyHomepagePhoto = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      section: z.enum(["showcase", "journal", "hero", "homestayHero"]),
      /** Showcase/journal: 0–2. Hero packs: 0–11. Homestay hero: 0–4. */
      itemIndex: z.number().int().min(0).max(11),
      publicUrl: z.string().min(1).max(500),
    }),
  )
  .handler(async ({ data }) =>
    applyHomepagePhotoCore({
      accessToken: data.accessToken,
      section: data.section,
      itemIndex: data.itemIndex,
      publicUrl: data.publicUrl,
    }),
  );
