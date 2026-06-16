import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isApiConfigured } from "@/lib/api/client";
import {
  fetchExperienceReviews,
  hostReplyReview,
  hideAdminReview,
  fetchAdminReviews,
  submitReview,
  type ReviewSummary,
} from "@/lib/api/reviews";
import { isSupabaseConfigured } from "@/lib/env.server";
import {
  createGuestReviewInDb,
  hostReplyToReviewInDb,
  loadPublishedReviewsForSlug,
  loadReviewForBookingId,
} from "@/lib/reviews-db.server";

export type { ReviewSummary };

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

export const createReview = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      accessToken: z.string().min(1),
      bookingId: z.string().min(1),
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(2000).optional(),
    }),
  )
  .handler(async ({ data }): Promise<ReviewSummary> => {
    if (isApiConfigured()) {
      try {
        return await submitReview(data.accessToken, {
          bookingId: data.bookingId,
          rating: data.rating,
          comment: data.comment,
        });
      } catch {
        // Fall through to Supabase when API is stale or unreachable.
      }
    }

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
  .handler(async ({ data }): Promise<ReviewSummary[]> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return fetchAdminReviews(data.accessToken);
  });

export const hideReview = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ accessToken: z.string().min(1), reviewId: z.string().min(1) }),
  )
  .handler(async ({ data }): Promise<ReviewSummary> => {
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return hideAdminReview(data.accessToken, data.reviewId);
  });
