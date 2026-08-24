import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { HostReviewsList, type RoyalReviewItem } from "@/components/host/HostReviewsList";
import {
  fetchOwnerHomestayReviews,
  type OwnerHomestayReviewSummary,
} from "@/lib/api/owner-homestay-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useHomestayOwnerAccess } from "@/lib/use-homestay-owner-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/homestay/reviews")({
  head: () => ({
    meta: [
      { title: "Homestay reviews — The Royal Passage" },
      { name: "description", content: "Recent guest ratings for your properties." },
    ],
  }),
  component: HomestayOwnerReviewsPage,
});

function mapHomestayReview(review: OwnerHomestayReviewSummary): RoyalReviewItem {
  return {
    id: review.id,
    listingTitle: review.homestayTitle,
    rating: review.rating,
    comment: review.comment,
    reviewerDisplayName: review.reviewerDisplayName,
    hostReply: review.hostReply,
    isVerified: review.isVerified,
    createdAt: review.createdAt,
  };
}

function HomestayOwnerReviewsPage() {
  const { accessToken, ready, loading } = useHomestayOwnerAccess();
  const [reviews, setReviews] = useState<RoyalReviewItem[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const rows = await fetchOwnerHomestayReviews(accessToken);
      setReviews(rows.map(mapHomestayReview));
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load reviews."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <HomestayOwnerDashboardShell
      title="Reviews"
      subtitle="Recent guest ratings and comments across your properties."
      variant="reviews"
    >
      {pageLoading ? (
        <p className="host-reviews-state">Loading reviews…</p>
      ) : pageError ? (
        <p className="host-reviews-error">{pageError}</p>
      ) : (
        <HostReviewsList
          reviews={reviews}
          accessToken={accessToken!}
          canReply={false}
          emptyMessage="No reviews yet. They will appear here after guests complete stays."
        />
      )}
    </HomestayOwnerDashboardShell>
  );
}
