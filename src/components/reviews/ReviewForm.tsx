import { useState } from "react";
import { StarRating } from "@/components/reviews/StarRating";

type ReviewFormProps = {
  onSubmit: (payload: { rating: number; comment: string }) => Promise<void>;
  submitting?: boolean;
  surface?: "light" | "dark";
};

export function ReviewForm({ onSubmit, submitting = false, surface = "dark" }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isLight = surface === "light";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await onSubmit({ rating, comment: comment.trim() });
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review.");
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <div>
        <div className={`eyebrow ${isLight ? "luxury-panel-label" : "text-[#D4AF37]/90"}`}>
          Your rating
        </div>
        <div className="mt-2">
          <StarRating value={rating} onChange={setRating} />
        </div>
      </div>
      <label className="block text-sm">
        <span className={`eyebrow ${isLight ? "luxury-panel-label" : "text-[#D4AF37]/90"}`}>
          Your review
        </span>
        <textarea
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share what made this experience memorable — what stood out, what you'd tell a friend…"
          className={
            isLight
              ? "mt-2 w-full rounded-sm border border-[rgb(74_0_0/0.22)] bg-white/60 px-3 py-2.5 text-sm text-[#4A0000] placeholder:text-[rgb(74_0_0/0.4)] focus:border-[#4A0000]/45 focus:outline-none"
              : "mt-2 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2 text-sm focus:outline-none"
          }
        />
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className={
          isLight
            ? "luxury-btn-sm luxury-btn-primary disabled:opacity-50"
            : "rounded-sm bg-ember px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
        }
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
