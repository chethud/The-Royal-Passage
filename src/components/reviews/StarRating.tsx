type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
};

export function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const starClass = size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex gap-1" role={onChange ? "radiogroup" : undefined}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`${starClass} transition-colors ${
            onChange ? "cursor-pointer hover:scale-110" : "cursor-default"
          } ${star <= value ? "text-ember" : "text-muted-foreground/30"}`}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
