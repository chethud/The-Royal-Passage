import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isApiConfigured } from "@/lib/api/client";
import {
  fetchExperienceReviews,
  hostReplyReview,
  type AdminModerationReview,
  type AdminModerationReviews,
  type ReviewSummary,
} from "@/lib/api/reviews";
import { isSupabaseConfigured } from "@/lib/env.server";
import {
  createGuestReviewInDb,
  hideExperienceReviewInDb,
  hideHomestayReviewInDb,
  hostReplyToReviewInDb,
  loadAdminModerationReviews,
  loadPublishedReviewsForSlug,
  loadReviewForBookingId,
} from "@/lib/reviews-db.server";

export type { AdminModerationReview, AdminModerationReviews, ReviewSummary };

export const getExperienceReviews = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<ReviewSummary[]> => {
    if (isApiConfigured()) {
      try {
        const fromApi = await fetchExperienceReviews(data.slug);
        if (fromApi.length > 0) return fromApi;
      } catch {
        // Fall through to Supabase.
      }
    }

    if (isSupabaseConfigured()) {
      return loadPublishedReviewsForSlug(data.slug);
    }

    return [];
  });

export const getReviewForBooking = createServerFn({ method: "GET" })
  .inputValidator(z.object({ bookingId: z.string().min(1) }))
  .handler(async ({ data }): Promise<ReviewSummary | null> => {
    if (!isSupabaseConfigured()) return null;
    return loadReviewForBookingId(data.bookingId);
  });

/** Supabase-only fallback when the Connect API is unavailable from the browser. */
export const createGuestReviewFallback = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      bookingId: z.string().min(1),
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data }): Promise<ReviewSummary> => {
    if (!isSupabaseConfigured()) {
      throw new Error("Reviews are not configured for this deployment.");
    }

    return createGuestReviewInDb(data.accessToken, {
      bookingId: data.bookingId,
      rating: data.rating,
      comment: data.comment,
    });
  });

export const replyToReview = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      reviewId: z.string().min(1),
      reply: z.string().min(1).max(2000),
    }),
  )
  .handler(async ({ data }): Promise<ReviewSummary> => {
    if (isApiConfigured()) {
      try {
        return await hostReplyReview(data.accessToken, data.reviewId, data.reply);
      } catch {
        // Fall through to Supabase.
      }
    }

    if (!isSupabaseConfigured()) {
      throw new Error("Reviews are not configured for this deployment.");
    }

    return hostReplyToReviewInDb(data.accessToken, data.reviewId, data.reply);
  });

export const listAdminReviews = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string().min(1) }))
  .handler(async ({ data }): Promise<AdminModerationReviews> => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured for this deployment.");
    }
    const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
    const { verifySupabaseAccessToken } = await import("@/lib/auth-verify.server");
    const user = await verifySupabaseAccessToken(data.accessToken);
    const supabase = getSupabaseAdmin();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (profile?.role !== "admin") {
      throw new Error("Only admins can moderate reviews.");
    }
    return loadAdminModerationReviews(5);
  });

export const hideReview = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ accessToken: z.string().min(1), reviewId: z.string().min(1) }),
  )
  .handler(async ({ data }): Promise<ReviewSummary> => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured for this deployment.");
    }
    return hideExperienceReviewInDb(data.accessToken, data.reviewId);
  });

export const hideHomestayReview = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ accessToken: z.string().min(1), reviewId: z.string().min(1) }),
  )
  .handler(async ({ data }): Promise<AdminModerationReview> => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured for this deployment.");
    }
    return hideHomestayReviewInDb(data.accessToken, data.reviewId);
  });
