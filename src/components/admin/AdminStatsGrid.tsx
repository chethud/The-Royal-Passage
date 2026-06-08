import type { AdminStats } from "@/lib/api/admin";
import { formatMoney } from "@/lib/money";

type AdminStatsGridProps = {
  stats: AdminStats;
};

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const items = [
    { label: "Guests", value: String(stats.totalGuests) },
    { label: "Hosts", value: String(stats.totalHosts) },
    { label: "Published experiences", value: String(stats.publishedExperiences) },
    { label: "Total bookings", value: String(stats.totalBookings) },
    {
      label: "Revenue collected",
      value: formatMoney(stats.revenueCollectedMinor, stats.currencySymbol),
    },
    { label: "Pending approvals", value: String(stats.pendingExperienceReviews) },
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
