import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { StarRating } from "@/components/reviews/StarRating";
import { fetchAdminReviews, hideAdminReview, type ReviewSummary } from "@/lib/api/reviews";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";

type AdminReviewsPanelProps = {
  accessToken: string;
};

export function AdminReviewsPanel({ accessToken }: AdminReviewsPanelProps) {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const rows = await fetchAdminReviews(accessToken);
      setReviews(rows);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to load reviews."));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleHide = async (reviewId: string) => {
    setBusyId(reviewId);
    try {
      await hideAdminReview(accessToken, reviewId);
      await load();
    } catch (err) {
      setError(toErrorMessage(err, "Failed to hide review."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <LuxuryCheckoutPanel>
      <h2 className="luxury-panel-heading font-display text-2xl">Reviews moderation</h2>
      <p className="luxury-panel-body mt-1 text-sm">Hide inappropriate reviews from public pages.</p>

      {loading ? (
        <p className="luxury-panel-body mt-6 text-sm">Loading reviews…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-destructive">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="luxury-panel-body mt-6 text-sm">No reviews yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-md border border-[rgb(74_0_0/0.14)] bg-[rgb(255_255_255/0.35)] p-4"
            >
              <div>
                <div className="luxury-panel-heading font-display text-lg">
                  {review.reviewerDisplayName ?? "Guest"}
                </div>
                <StarRating value={review.rating} size="sm" />
                {review.comment ? (
                  <p className="luxury-panel-body mt-2 text-sm">{review.comment}</p>
                ) : null}
                <div className="luxury-panel-label mt-1 text-xs uppercase tracking-[0.12em]">
                  {review.status}
                </div>
              </div>
              {review.status === "published" ? (
                <button
                  type="button"
                  disabled={busyId === review.id}
                  onClick={() => void handleHide(review.id)}
                  className="luxury-btn-sm luxury-btn-panel-danger disabled:opacity-50"
                >
                  Hide
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </LuxuryCheckoutPanel>
  );
}
