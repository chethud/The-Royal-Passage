import { ArrowRight, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";
import { StarRating } from "@/components/reviews/StarRating";
import {
  CornerFiligree,
  MaharajaEmblem,
  OrnamentalDivider,
  PalaceSilhouette,
} from "@/components/site/RoyalHeritageDecor";
import { toErrorMessage } from "@/lib/api/client";
import { formatDateLong } from "@/lib/date-format";
import { replyToReview } from "@/lib/review-fns";

export type RoyalReviewItem = {
  id: string;
  listingTitle: string;
  rating: number;
  comment: string | null;
  reviewerDisplayName: string | null;
  hostReply: string | null;
  isVerified: boolean;
  createdAt: string;
};

type HostReviewsListProps = {
  reviews: RoyalReviewItem[];
  accessToken: string;
  onUpdated?: () => void;
  canReply?: boolean;
  emptyMessage?: string;
};

function ReviewCorners() {
  return (
    <>
      <CornerFiligree className="host-reviews-entry__corner host-reviews-entry__corner--tl" />
      <CornerFiligree className="host-reviews-entry__corner host-reviews-entry__corner--tr" />
      <CornerFiligree className="host-reviews-entry__corner host-reviews-entry__corner--bl" />
      <CornerFiligree className="host-reviews-entry__corner host-reviews-entry__corner--br" />
    </>
  );
}

export function HostReviewsList({
  reviews,
  accessToken,
  onUpdated,
  canReply = true,
  emptyMessage = "No reviews yet. They will appear here after guests complete experiences.",
}: HostReviewsListProps) {
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setBusyId(reviewId);
    setError(null);
    try {
      await replyToReview({
        data: {
          accessToken,
          reviewId,
          reply: replyText.trim(),
        },
      });
      setReplyingId(null);
      setReplyText("");
      onUpdated?.();
    } catch (err) {
      setError(toErrorMessage(err, "Failed to post reply."));
    } finally {
      setBusyId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="host-reviews-empty">
        <PalaceSilhouette className="host-reviews-empty__palace" />
        <div className="host-reviews-empty__content">
          <span className="host-reviews-empty__medallion" aria-hidden>
            <Star className="host-reviews-empty__icon" />
          </span>
          <p className="host-reviews-empty__text">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="host-reviews-stack">
      {error ? <p className="host-reviews-error">{error}</p> : null}

      <ul className="host-reviews-list">
        {reviews.map((review, index) => (
          <li key={review.id}>
            <article className="host-reviews-entry">
              <ReviewCorners />

              <div className="host-reviews-entry__layout">
                <div className="host-reviews-entry__main">
                  <div className="host-reviews-entry__title">{review.listingTitle}</div>
                  <div className="host-reviews-entry__meta">
                    <span>{review.reviewerDisplayName ?? "Guest"}</span>
                    <span className="host-reviews-entry__dot" aria-hidden>
                      ·
                    </span>
                    <span>{formatDateLong(review.createdAt.slice(0, 10))}</span>
                    {review.isVerified ? (
                      <span className="host-reviews-verified">
                        <ShieldCheck className="host-reviews-verified__icon" aria-hidden />
                        Verified visit
                      </span>
                    ) : null}
                  </div>

                  {review.comment ? (
                    <p className="host-reviews-entry__comment">{review.comment}</p>
                  ) : null}

                  {review.hostReply ? (
                    <div className="host-reviews-reply">
                      <div className="host-reviews-reply__label">Your reply</div>
                      <p className="host-reviews-reply__body">{review.hostReply}</p>
                    </div>
                  ) : canReply && replyingId === review.id ? (
                    <div className="host-reviews-compose">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Thank your guest and share any follow-up…"
                        className="host-reviews-compose__input"
                      />
                      <div className="host-reviews-compose__actions">
                        <button
                          type="button"
                          disabled={busyId === review.id}
                          onClick={() => void handleReply(review.id)}
                          className="host-reviews-compose__submit"
                        >
                          {busyId === review.id ? "Posting…" : "Post reply"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingId(null);
                            setReplyText("");
                          }}
                          className="host-reviews-compose__cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : canReply ? (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingId(review.id);
                        setReplyText("");
                      }}
                      className="host-reviews-reply-action"
                    >
                      Reply to guest
                      <ArrowRight className="host-reviews-reply-action__icon" aria-hidden />
                    </button>
                  ) : null}
                </div>

                <div className="host-reviews-entry__rating" aria-label={`${review.rating} out of 5 stars`}>
                  <StarRating value={review.rating} size="md" tone="royal" />
                </div>
              </div>
            </article>

            {index < reviews.length - 1 ? (
              <OrnamentalDivider className="host-reviews-separator" />
            ) : null}
          </li>
        ))}
      </ul>

      <div className="host-reviews-footer">
        <span className="host-reviews-footer__line" aria-hidden />
        <MaharajaEmblem className="host-reviews-footer__emblem" />
        <span className="host-reviews-footer__line" aria-hidden />
      </div>
    </div>
  );
}
