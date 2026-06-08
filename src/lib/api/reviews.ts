import { apiFetch } from "@/lib/api/client";

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
  return apiFetch<ReviewSummary[]>(`/api/v1/experiences/${slug}/reviews`);
}

export function submitReview(
  accessToken: string,
  payload: { bookingId: string; rating: number; comment?: string },
) {
  return apiFetch<ReviewSummary>("/api/v1/reviews", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function hostReplyReview(accessToken: string, reviewId: string, reply: string) {
  return apiFetch<ReviewSummary>(`/api/v1/host/reviews/${reviewId}/reply`, {
    method: "POST",
    accessToken,
    body: JSON.stringify({ reply }),
  });
}

export function fetchAdminReviews(accessToken: string) {
  return apiFetch<ReviewSummary[]>("/api/v1/admin/reviews", { accessToken });
}

export function hideAdminReview(accessToken: string, reviewId: string) {
  return apiFetch<ReviewSummary>(`/api/v1/admin/reviews/${reviewId}/hide`, {
    method: "PATCH",
    accessToken,
  });
}
