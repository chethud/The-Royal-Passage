import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import {
  HostReplyToReviewRequestSchema,
  ListExperienceReviewsRequestSchema,
} from "@/gen/royalpassage/v1/service_pb";
import { CreateReviewRequestSchema, HostReplyRequestSchema } from "@/gen/royalpassage/v1/types_pb";

export type ReviewSummary = {
  id: string;
  experienceId: string;
  bookingId: string | null;
  rating: number;
  comment: string | null;
  reviewerDisplayName: string | null;
  hostReply: string | null;
  hostRepliedAt: string | null;
  isVerified: boolean;
  status: string;
  createdAt: string;
};

type ReviewSummaryLike = {
  id: string;
  experienceId: string;
  bookingId?: string | null;
  rating: number;
  comment?: string | null;
  reviewerDisplayName?: string | null;
  hostReply?: string | null;
  hostRepliedAt?: string | null;
  isVerified?: boolean;
  status?: string;
  createdAt: string;
};

export function normalizeReviewSummary(raw: ReviewSummaryLike): ReviewSummary {
  return {
    id: raw.id,
    experienceId: raw.experienceId,
    bookingId: raw.bookingId ?? null,
    rating: raw.rating,
    comment: raw.comment ?? null,
    reviewerDisplayName: raw.reviewerDisplayName ?? null,
    hostReply: raw.hostReply ?? null,
    hostRepliedAt: raw.hostRepliedAt ?? null,
    isVerified: Boolean(raw.isVerified),
    status: raw.status ?? "published",
    createdAt: raw.createdAt,
  };
}

export function fetchExperienceReviews(slug: string) {
  const client = createRoyalPassageClient();
  return rpcCall(async () => {
    const response = await client.listExperienceReviews(
      create(ListExperienceReviewsRequestSchema, { slug }),
    );
    return (response.reviews as ReviewSummaryLike[]).map(normalizeReviewSummary);
  });
}

export function submitReview(
  accessToken: string,
  payload: { bookingId: string; rating: number; comment?: string },
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const result = await client.createReview(create(CreateReviewRequestSchema, payload));
    return normalizeReviewSummary(result as ReviewSummaryLike);
  });
}

export function hostReplyReview(accessToken: string, reviewId: string, reply: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const result = await client.hostReplyToReview(
      create(HostReplyToReviewRequestSchema, {
        reviewId,
        reply: create(HostReplyRequestSchema, { reply }),
      }),
    );
    return normalizeReviewSummary(result as ReviewSummaryLike);
  });
}

export type AdminModerationReview = {
  id: string;
  kind: "experience" | "homestay" | string;
  listingId: string;
  listingTitle: string | null;
  rating: number;
  comment: string | null;
  reviewerDisplayName: string | null;
  status: string;
  createdAt: string;
};

export type AdminModerationReviews = {
  experiences: AdminModerationReview[];
  homestays: AdminModerationReview[];
};
