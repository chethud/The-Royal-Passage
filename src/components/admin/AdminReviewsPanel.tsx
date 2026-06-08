import { useCallback, useEffect, useState } from "react";
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
    <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6">
      <h2 className="font-display text-2xl">Reviews moderation</h2>
      <p className="mt-1 text-sm text-muted-foreground">Hide inappropriate reviews from public pages.</p>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading reviews…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-destructive">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-sm border border-[oklch(0.88_0.08_86_/_0.15)] p-4"
            >
              <div>
                <div className="font-display text-lg">{review.reviewerDisplayName ?? "Guest"}</div>
                <StarRating value={review.rating} size="sm" />
                {review.comment ? (
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                ) : null}
                <div className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {review.status}
                </div>
              </div>
              {review.status === "published" ? (
                <button
                  type="button"
                  disabled={busyId === review.id}
                  onClick={() => void handleHide(review.id)}
                  className="rounded-sm border border-destructive/40 px-3 py-1.5 text-xs text-destructive disabled:opacity-50"
                >
                  Hide
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
