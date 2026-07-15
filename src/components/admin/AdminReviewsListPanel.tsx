import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { StarRating } from "@/components/reviews/StarRating";
import {
  hideHomestayReview,
  hideReview,
  listAdminReviews,
  type AdminModerationReview,
  type AdminModerationReviews,
} from "@/lib/review-fns";
import { toErrorMessage } from "@/lib/api/client";

type AdminReviewsListPanelProps = {
  accessToken: string;
  kind: "experience" | "homestay";
  backTo: string;
  backLabel: string;
};

const EMPTY: AdminModerationReviews = { experiences: [], homestays: [] };

export function AdminReviewsListPanel({
  accessToken,
  kind,
  backTo,
  backLabel,
}: AdminReviewsListPanelProps) {
  const [payload, setPayload] = useState<AdminModerationReviews>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reviews = kind === "experience" ? payload.experiences : payload.homestays;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPayload(await listAdminReviews({ data: { accessToken } }));
    } catch (err) {
      setError(toErrorMessage(err, "Failed to load reviews."));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleHide = async (review: AdminModerationReview) => {
    setBusyId(review.id);
    try {
      if (review.kind === "homestay") {
        await hideHomestayReview({ data: { accessToken, reviewId: review.id } });
      } else {
        await hideReview({ data: { accessToken, reviewId: review.id } });
      }
      await load();
    } catch (err) {
      setError(toErrorMessage(err, "Failed to hide review."));
    } finally {
      setBusyId(null);
    }
  };

  const heading = kind === "experience" ? "Experience reviews" : "Homestay reviews";

  return (
    <>
      <Link
        to={backTo}
        className="luxury-btn-sm dashboard-chrome-btn mb-5 inline-flex items-center no-underline"
      >
        {backLabel}
      </Link>

      <LuxuryCheckoutPanel>
        <h2 className="luxury-panel-heading font-display text-2xl">{heading}</h2>
        <p className="luxury-panel-body mt-1 text-sm">
          Top 5 by rating. Hide inappropriate reviews from public pages.
        </p>

        {loading ? (
          <p className="luxury-panel-body mt-6 text-sm">Loading reviews…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-destructive">{error}</p>
        ) : reviews.length === 0 ? (
          <p className="luxury-panel-body mt-6 text-sm">No reviews yet.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {reviews.map((review) => {
              const canHide =
                review.kind === "homestay"
                  ? review.status === "published" || review.status === "pending"
                  : review.status === "published";
              return (
                <li
                  key={review.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-md border border-[rgb(74_0_0/0.14)] bg-[rgb(255_255_255/0.35)] p-4"
                >
                  <div>
                    <div className="luxury-panel-heading font-display text-lg">
                      {review.reviewerDisplayName ?? "Guest"}
                    </div>
                    {review.listingTitle ? (
                      <div className="luxury-panel-body mt-0.5 text-sm">{review.listingTitle}</div>
                    ) : null}
                    <StarRating value={review.rating} size="sm" />
                    {review.comment ? (
                      <p className="luxury-panel-body mt-2 text-sm">{review.comment}</p>
                    ) : null}
                    <div className="luxury-panel-label mt-1 text-xs uppercase tracking-[0.12em]">
                      {review.status}
                    </div>
                  </div>
                  {canHide ? (
                    <button
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => void handleHide(review)}
                      className="luxury-btn-sm luxury-btn-panel-danger disabled:opacity-50"
                    >
                      Hide
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </LuxuryCheckoutPanel>
    </>
  );
}
