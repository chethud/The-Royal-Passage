import { useState } from "react";
import { StarRating } from "@/components/reviews/StarRating";

type ReviewFormProps = {
  onSubmit: (payload: { rating: number; comment: string }) => Promise<void>;
  submitting?: boolean;
};

export function ReviewForm({ onSubmit, submitting = false }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div>
        <div className="eyebrow text-muted-foreground">Your rating</div>
        <div className="mt-2">
          <StarRating value={rating} onChange={setRating} />
        </div>
      </div>
      <label className="block text-sm">
        <span className="eyebrow text-muted-foreground">Comment</span>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share what made this experience memorable…"
          className="mt-2 w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] bg-background/50 px-3 py-2 text-sm"
        />
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-sm bg-ember px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
