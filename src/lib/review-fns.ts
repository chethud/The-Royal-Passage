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

export type { ReviewSummary };

export const getExperienceReviews = createServerFn({ method: "POST" })
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }): Promise<ReviewSummary[]> => {
    if (!isApiConfigured()) return [];
    return fetchExperienceReviews(data.slug);
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
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return submitReview(data.accessToken, {
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
    if (!isApiConfigured()) throw new Error("API is not configured.");
    return hostReplyReview(data.accessToken, data.reviewId, data.reply);
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
