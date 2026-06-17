export type PaymentMethod = "cod";

type PaymentMethodSelectorProps = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  /** Light cream panel (checkout) vs dark page (detail). */
  surface?: "light" | "dark";
};

const OPTIONS: { id: PaymentMethod; title: string; description: string }[] = [
  {
    id: "cod",
    title: "Pay at venue",
    description: "Pay your host in cash or UPI when you arrive. No online payment required.",
  },
];

export function PaymentMethodSelector({
  value,
  onChange,
  surface = "dark",
}: PaymentMethodSelectorProps) {
  const isLight = surface === "light";

  return (
    <div className="space-y-1">
      {OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`group flex w-full items-start gap-3 border-l-[3px] py-3.5 pl-4 pr-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A0000]/25 ${
              active
                ? isLight
                  ? "border-brand-maroon-deep text-brand-maroon-deep"
                  : "border-gold text-foreground"
                : isLight
                  ? "border-transparent text-brand-maroon-deep/75 hover:border-brand-maroon-deep/50 hover:text-brand-maroon-deep"
                  : "border-transparent text-foreground/75 hover:border-gold/35 hover:text-foreground"
            }`}
          >
            <span
              className={`mt-1.5 flex h-2 w-2 shrink-0 rounded-full transition-colors ${
                active
                  ? isLight
                    ? "bg-brand-maroon-deep"
                    : "bg-gold"
                  : isLight
                    ? "bg-brand-maroon-deep/20 group-hover:bg-brand-maroon-deep/45"
                    : "bg-muted-foreground/30 group-hover:bg-gold/60"
              }`}
              aria-hidden
            />
            <span>
              <span
                className={`block font-display text-lg tracking-wide transition-colors ${
                  isLight ? "group-hover:text-brand-maroon-deep" : "group-hover:text-gold"
                }`}
              >
                {option.title}
              </span>
              <span
                className={`mt-1 block text-sm leading-relaxed ${
                  isLight ? "luxury-panel-body" : "text-muted-foreground"
                }`}
              >
                {option.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
