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
    <LuxuryCheckoutPanel>
      <div>
        <h2 className="eyebrow luxury-panel-label mb-4">{label}</h2>
        {items.length === 0 ? (
          <p className="luxury-panel-body text-sm">{emptyMessage}</p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li key={item} className="luxury-panel-body flex gap-3 text-sm leading-relaxed">
                <span className="text-[#8B6914]">—</span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </LuxuryCheckoutPanel>
  );
}
