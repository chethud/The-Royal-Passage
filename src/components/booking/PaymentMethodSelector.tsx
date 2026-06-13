export type PaymentMethod = "cod";

type PaymentMethodSelectorProps = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

const OPTIONS: { id: PaymentMethod; title: string; description: string }[] = [
  {
    id: "cod",
    title: "Pay at venue",
    description: "Pay your host in cash or UPI when you arrive. No online payment required.",
  },
];

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`w-full rounded-sm border p-4 text-left transition-colors ${
              active
                ? "border-ember bg-ember/15 shadow-[var(--shadow-gold)]"
                : "border-[oklch(0.72_0.09_78_/_0.22)] hover:border-ember/45"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  active ? "border-ember bg-ember" : "border-muted-foreground/40"
                }`}
                aria-hidden
              >
                {active ? <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" /> : null}
              </span>
              <span>
                <span className="block font-display text-lg text-foreground">{option.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{option.description}</span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
