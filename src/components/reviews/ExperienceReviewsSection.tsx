import type { ReviewSummary } from "@/lib/api/reviews";
import { formatDateLong } from "@/lib/date-format";
import { StarRating } from "@/components/reviews/StarRating";

type ExperienceReviewsSectionProps = {
  reviews: ReviewSummary[];
  surface?: "light" | "dark";
};

export function ExperienceReviewsSection({
  reviews,
  surface = "dark",
}: ExperienceReviewsSectionProps) {
  const isLight = surface === "light";

  if (reviews.length === 0) {
    return (
      <p className={`text-sm ${isLight ? "luxury-panel-body" : "text-[#D6C8B5]/85"}`}>
        No guest reviews yet. Be the first after your visit.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li
          key={review.id}
          className={
            isLight
              ? "rounded-sm border border-[rgb(74_0_0/0.12)] bg-[rgb(255_255_255/0.45)] p-5"
              : "rounded-md border border-[rgb(200_162_90/0.22)] bg-[rgb(0_0_0/0.15)] p-5"
          }
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div
                className={`font-display text-lg uppercase tracking-[0.03em] ${
                  isLight ? "luxury-panel-heading" : "text-[#F7F1E8]"
                }`}
              >
                {review.reviewerDisplayName ?? "Guest"}
                {review.isVerified ? (
                  <span
                    className={`ml-2 text-[0.6rem] font-semibold uppercase tracking-[0.12em] ${
                      isLight ? "text-[#8B6914]" : "text-[#D4AF37]"
                    }`}
                  >
                    Verified visit
                  </span>
                ) : null}
              </div>
              <div
                className={`text-xs ${isLight ? "luxury-panel-body" : "text-[#D6C8B5]/80"}`}
              >
                {formatDateLong(review.createdAt.slice(0, 10))}
              </div>
            </div>
            <StarRating value={review.rating} size="sm" />
          </div>
          {review.comment ? (
            <p
              className={`mt-3 text-sm leading-relaxed ${
                isLight ? "luxury-panel-body" : "text-[#E8DCC8]/92"
              }`}
            >
              {review.comment}
            </p>
          ) : null}
          {review.hostReply ? (
            <div
              className={`mt-4 border-l-2 pl-4 text-sm ${
                isLight
                  ? "border-[#4A0000]/25 text-[#4A0000]/85"
                  : "border-[#D4AF37]/45 text-[#E8DCC8]/90"
              }`}
            >
              <div
                className={`eyebrow ${isLight ? "luxury-panel-label" : "text-[#D4AF37]/90"}`}
              >
                Host reply
              </div>
              <p className="mt-1">{review.hostReply}</p>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
