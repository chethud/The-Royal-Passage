import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";

export function DetailListPanel({
  label,
  items,
  emptyMessage = "Your host will confirm full details when you book.",
}: {
  label: string;
  items: string[];
  emptyMessage?: string;
}) {
  return (
    <LuxuryCheckoutPanel compact>
      <div>
        <h2 className="eyebrow luxury-panel-label mb-1.5">{label}</h2>
        {items.length === 0 ? (
          <p className="luxury-panel-body text-sm">{emptyMessage}</p>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item} className="luxury-panel-body flex gap-2 text-[0.8125rem] leading-snug">
                <span className="shrink-0 text-[#3a0000]/80">—</span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </LuxuryCheckoutPanel>
  );
}
