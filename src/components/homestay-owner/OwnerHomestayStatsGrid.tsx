import type { OwnerDashboardStats } from "@/lib/api/owner-homestay-bookings";
import { formatMoney } from "@/lib/money";

type OwnerHomestayStatsGridProps = {
  stats: OwnerDashboardStats;
};

export function OwnerHomestayStatsGrid({ stats }: OwnerHomestayStatsGridProps) {
  const symbol = stats.currencySymbol || "₹";
  const items = [
    { label: "Pending requests", value: stats.pendingBookings },
    { label: "Confirmed stays", value: stats.confirmedBookings },
    { label: "Check-ins today", value: stats.checkInToday },
    { label: "Published properties", value: stats.publishedHomestays },
    { label: "Collected", value: formatMoney(stats.revenueCollectedMinor, symbol) },
    { label: "Pending payment", value: formatMoney(stats.revenuePendingMinor, symbol) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-sm border luxury-panel-divider px-4 py-5">
          <p className="luxury-panel-label text-[0.65rem] uppercase tracking-[0.14em]">{item.label}</p>
          <p className="luxury-panel-heading mt-2 font-display text-3xl">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
