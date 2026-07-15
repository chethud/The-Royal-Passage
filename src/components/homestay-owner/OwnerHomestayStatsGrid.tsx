import { Link } from "@tanstack/react-router";
import type { OwnerDashboardStats } from "@/lib/api/owner-homestay-bookings";
import { formatMoney } from "@/lib/money";

type OwnerHomestayStatsGridProps = {
  stats: OwnerDashboardStats;
};

export function OwnerHomestayStatsGrid({ stats }: OwnerHomestayStatsGridProps) {
  const symbol = stats.currencySymbol || "₹";
  const items = [
    { label: "Pending requests", value: stats.pendingBookings, to: "/homestay/bookings" as const },
    { label: "Confirmed stays", value: stats.confirmedBookings, to: "/homestay/bookings" as const },
    { label: "Check-ins today", value: stats.checkInToday, to: "/homestay/bookings" as const },
    {
      label: "Published properties",
      value: stats.publishedHomestays,
      to: "/homestay/properties" as const,
    },
    {
      label: "Collected",
      value: formatMoney(stats.revenueCollectedMinor, symbol),
      to: "/homestay/revenue" as const,
    },
    {
      label: "Pending payment",
      value: formatMoney(stats.revenuePendingMinor, symbol),
      to: "/homestay/revenue" as const,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          className="dashboard-panel-card block px-4 py-5 no-underline transition-colors hover:border-[rgb(200_162_90/0.45)]"
        >
          <p className="luxury-panel-label text-[0.65rem] uppercase tracking-[0.14em]">{item.label}</p>
          <p className="luxury-panel-heading mt-2 font-display text-3xl">{item.value}</p>
        </Link>
      ))}
    </div>
  );
}
