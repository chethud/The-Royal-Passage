type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
  tone?: "default" | "royal";
};

export function StarRating({ value, onChange, size = "md", tone = "default" }: StarRatingProps) {
  const starClass = size === "sm" ? "text-lg" : "text-2xl";
  const activeClass =
    tone === "royal"
      ? "text-[#D4AF37] drop-shadow-[0_0_6px_rgb(212_175_55/0.35)]"
      : "text-ember";
  const inactiveClass =
    tone === "royal" ? "text-[rgb(212_175_55/0.22)]" : "text-muted-foreground/30";

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
          } ${star <= value ? activeClass : inactiveClass}`}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
