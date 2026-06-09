import { create } from "@bufbuild/protobuf";
import { createRoyalPassageClient, rpcCall } from "@/lib/api/connect";
import {
  HideAdminReviewRequestSchema,
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

export function fetchExperienceReviews(slug: string) {
  const client = createRoyalPassageClient();
  return rpcCall(async () => {
    const response = await client.listExperienceReviews(
      create(ListExperienceReviewsRequestSchema, { slug }),
    );
    return response.reviews as ReviewSummary[];
  });
}

export function submitReview(
  accessToken: string,
  payload: { bookingId: string; rating: number; comment?: string },
) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.createReview(create(CreateReviewRequestSchema, payload)),
  ) as Promise<ReviewSummary>;
}

export function hostReplyReview(accessToken: string, reviewId: string, reply: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.hostReplyToReview(
      create(HostReplyToReviewRequestSchema, {
        reviewId,
        reply: create(HostReplyRequestSchema, { reply }),
      }),
    ),
  ) as Promise<ReviewSummary>;
}

export function fetchAdminReviews(accessToken: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(async () => {
    const response = await client.listAdminReviews({});
    return response.reviews as ReviewSummary[];
  });
}

export function hideAdminReview(accessToken: string, reviewId: string) {
  const client = createRoyalPassageClient(accessToken);
  return rpcCall(() =>
    client.hideAdminReview(create(HideAdminReviewRequestSchema, { reviewId })),
  ) as Promise<ReviewSummary>;
}
