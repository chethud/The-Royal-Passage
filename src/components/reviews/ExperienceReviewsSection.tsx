import type { ReviewSummary } from "@/lib/api/reviews";
import { formatDateLong } from "@/lib/date-format";
import { StarRating } from "@/components/reviews/StarRating";

type ExperienceReviewsSectionProps = {
  reviews: ReviewSummary[];
};

export function ExperienceReviewsSection({ reviews }: ExperienceReviewsSectionProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No guest reviews yet. Be the first after your visit.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-display text-lg">
                {review.reviewerDisplayName ?? "Guest"}
                {review.isVerified ? (
                  <span className="ml-2 text-xs text-ember">Verified visit</span>
                ) : null}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDateLong(review.createdAt.slice(0, 10))}
              </div>
            </div>
            <StarRating value={review.rating} size="sm" />
          </div>
          {review.comment ? (
            <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>
          ) : null}
          {review.hostReply ? (
            <div className="mt-4 border-l-2 border-ember/40 pl-4 text-sm">
              <div className="eyebrow text-muted-foreground">Host reply</div>
              <p className="mt-1">{review.hostReply}</p>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
