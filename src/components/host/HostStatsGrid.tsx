import type { HostDashboardStats } from "@/lib/api/host";
import { ClickableStatCard } from "@/components/dashboard/ClickableStatCard";
import { formatMoney } from "@/lib/money";

type HostStatsGridProps = {
  stats: HostDashboardStats;
};

export function HostStatsGrid({ stats }: HostStatsGridProps) {
  const items = [
    {
      label: "Total bookings",
      value: String(stats.totalBookings),
      to: "/host/bookings" as const,
      search: { status: "all" as const },
    },
    {
      label: "Today's sessions",
      value: String(stats.todayBookings),
      to: "/host/bookings" as const,
      search: { status: "today" as const },
    },
    {
      label: "Pending requests",
      value: String(stats.pendingBookings),
      to: "/host/bookings" as const,
      search: { status: "pending" as const },
    },
    {
      label: "Confirmed",
      value: String(stats.confirmedBookings),
      to: "/host/bookings" as const,
      search: { status: "confirmed" as const },
    },
    {
      label: "Week estimate",
      value: formatMoney(stats.weekRevenueEstimateMinor, stats.currencySymbol),
      to: "/host/revenue" as const,
    },
    {
      label: "Revenue collected",
      value: formatMoney(stats.revenueCollectedMinor, stats.currencySymbol),
      to: "/host/revenue" as const,
    },
    {
      label: "COD pending",
      value: formatMoney(stats.revenuePendingMinor, stats.currencySymbol),
      to: "/host/bookings" as const,
      search: { payment: "cod-pending" as const },
    },
    {
      label: "Completed",
      value: String(stats.completedBookings),
      to: "/host/bookings" as const,
      search: { status: "completed" as const },
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ClickableStatCard
          key={item.label}
          label={item.label}
          value={item.value}
          to={item.to}
          search={item.search}
        />
      ))}
    </div>
  );
}
