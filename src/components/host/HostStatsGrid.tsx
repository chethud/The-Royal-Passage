import type { HostDashboardStats } from "@/lib/api/host";
import { formatMoney } from "@/lib/money";

type HostStatsGridProps = {
  stats: HostDashboardStats;
};

export function HostStatsGrid({ stats }: HostStatsGridProps) {
  const items = [
    { label: "Today's sessions", value: String(stats.todayBookings) },
    { label: "Pending requests", value: String(stats.pendingBookings) },
    { label: "Confirmed", value: String(stats.confirmedBookings) },
    { label: "Upcoming", value: String(stats.upcomingBookings) },
    {
      label: "Week estimate",
      value: formatMoney(stats.weekRevenueEstimateMinor, stats.currencySymbol),
    },
    {
      label: "Revenue collected",
      value: formatMoney(stats.revenueCollectedMinor, stats.currencySymbol),
    },
    {
      label: "COD pending",
      value: formatMoney(stats.revenuePendingMinor, stats.currencySymbol),
    },
    { label: "Completed", value: String(stats.completedBookings) },
    { label: "Live experiences", value: String(stats.publishedExperiences) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.label}
          className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5"
        >
          <div className="eyebrow text-muted-foreground">{item.label}</div>
          <div className="mt-2 font-display text-3xl text-ember">{item.value}</div>
        </article>
      ))}
    </div>
  );
}
