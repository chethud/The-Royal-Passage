import { useState } from "react";
import { StarRating } from "@/components/reviews/StarRating";
import type { HostReviewSummary } from "@/lib/api/host";
import { replyToReview } from "@/lib/review-fns";
import { formatDateLong } from "@/lib/date-format";

type HostReviewsListProps = {
  reviews: HostReviewSummary[];
  accessToken: string;
  onUpdated?: () => void;
};

export function HostReviewsList({ reviews, accessToken, onUpdated }: HostReviewsListProps) {
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
        data: { accessToken, reviewId, reply: replyText.trim() },
      });
      setReplyingId(null);
      setReplyText("");
      onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post reply.");
    } finally {
      setBusyId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews yet. They will appear here after guests complete experiences.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <ul className="space-y-4">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-display text-lg">{review.experienceTitle}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {review.reviewerDisplayName ?? "Guest"} ·{" "}
                  {formatDateLong(review.createdAt.slice(0, 10))}
                  {review.isVerified ? (
                    <span className="ml-2 text-xs text-ember">Verified visit</span>
                  ) : null}
                </div>
              </div>
              <StarRating value={review.rating} size="sm" />
            </div>
            {review.comment ? (
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">{review.comment}</p>
            ) : null}
            {review.hostReply ? (
              <div className="mt-4 border-l-2 border-ember/40 pl-4 text-sm">
                <div className="eyebrow text-muted-foreground">Your reply</div>
                <p className="mt-1">{review.hostReply}</p>
              </div>
            ) : replyingId === review.id ? (
              <div className="mt-4 space-y-3">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank your guest and share any follow-up…"
                  className="w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === review.id}
                    onClick={() => void handleReply(review.id)}
                    className="rounded-sm bg-ember px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-50"
                  >
                    {busyId === review.id ? "Posting…" : "Post reply"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingId(null);
                      setReplyText("");
                    }}
                    className="rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-3 py-1.5 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setReplyingId(review.id);
                  setReplyText("");
                }}
                className="mt-4 text-xs text-ember hover:underline"
              >
                Reply to guest
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
