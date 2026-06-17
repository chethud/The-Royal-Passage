export type HomestayPaymentMethod = "cod";

type HomestayCashPaymentSelectorProps = {
  value: HomestayPaymentMethod;
  onChange: (method: HomestayPaymentMethod) => void;
  surface?: "light" | "dark";
};

export function HomestayCashPaymentSelector({
  value,
  onChange,
  surface = "light",
}: HomestayCashPaymentSelectorProps) {
  const isLight = surface === "light";
  const active = value === "cod";

  return (
    <button
      type="button"
      onClick={() => onChange("cod")}
      className={`group flex w-full items-start gap-3 border-l-[3px] py-3.5 pl-4 pr-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A0000]/25 ${
        active
          ? isLight
            ? "border-brand-maroon-deep text-brand-maroon-deep"
            : "border-gold text-foreground"
          : isLight
            ? "border-transparent text-brand-maroon-deep/75"
            : "border-transparent text-foreground/75"
      }`}
    >
      <span
        className={`mt-1.5 flex h-2 w-2 shrink-0 rounded-full ${
          active ? (isLight ? "bg-brand-maroon-deep" : "bg-gold") : "bg-brand-maroon-deep/20"
        }`}
        aria-hidden
      />
      <span>
        <span className="block font-display text-lg tracking-wide">Pay in cash at the homestay</span>
        <span className={`mt-1 block text-sm leading-relaxed ${isLight ? "luxury-panel-body" : "text-muted-foreground"}`}>
          Bring cash for the full stay total at check-in. Your host will confirm the amount when you arrive.
        </span>
      </span>
    </button>
  );
}
