import type { ComponentType, SVGProps } from "react";
import { Link } from "@tanstack/react-router";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  IndianRupee,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { CornerFiligree } from "@/components/site/RoyalHeritageDecor";
import type { HostDashboardStats } from "@/lib/api/host";
import type { BookingListSearch } from "@/lib/dashboard-booking-filters";
import { formatMoney } from "@/lib/money";

type HostStatsGridProps = {
  stats: HostDashboardStats;
};

type StatItem = {
  label: string;
  value: string;
  to: "/host/bookings" | "/host/revenue";
  search?: BookingListSearch;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: "default" | "positive";
};

function LedgerCorners() {
  return (
    <>
      <CornerFiligree className="host-overview-panel__corner host-overview-panel__corner--tl" />
      <CornerFiligree className="host-overview-panel__corner host-overview-panel__corner--tr" />
      <CornerFiligree className="host-overview-panel__corner host-overview-panel__corner--bl" />
      <CornerFiligree className="host-overview-panel__corner host-overview-panel__corner--br" />
    </>
  );
}

export function HostStatsGrid({ stats }: HostStatsGridProps) {
  const items: StatItem[] = [
    {
      label: "Total bookings",
      value: String(stats.totalBookings),
      to: "/host/bookings",
      search: { status: "all" },
      Icon: ClipboardList,
    },
    {
      label: "Today's sessions",
      value: String(stats.todayBookings),
      to: "/host/bookings",
      search: { status: "today" },
      Icon: CalendarDays,
    },
    {
      label: "Pending requests",
      value: String(stats.pendingBookings),
      to: "/host/bookings",
      search: { status: "pending" },
      Icon: Clock3,
    },
    {
      label: "Confirmed",
      value: String(stats.confirmedBookings),
      to: "/host/bookings",
      search: { status: "confirmed" },
      Icon: ShieldCheck,
    },
    {
      label: "Week estimate",
      value: formatMoney(stats.weekRevenueEstimateMinor, stats.currencySymbol),
      to: "/host/revenue",
      Icon: IndianRupee,
    },
    {
      label: "Revenue collected",
      value: formatMoney(stats.revenueCollectedMinor, stats.currencySymbol),
      to: "/host/revenue",
      Icon: Banknote,
    },
    {
      label: "COD pending",
      value: formatMoney(stats.revenuePendingMinor, stats.currencySymbol),
      to: "/host/bookings",
      search: { payment: "cod-pending" },
      Icon: Wallet,
    },
    {
      label: "Completed",
      value: String(stats.completedBookings),
      to: "/host/bookings",
      search: { status: "completed" },
      Icon: CheckCircle2,
      tone: "positive",
    },
  ];

  return (
    <div className="host-overview-panel host-overview-ledger">
      <LedgerCorners />
      <div className="host-overview-ledger__grid">
        {items.map((item) => {
          const Icon = item.Icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              search={item.search}
              className={`host-overview-stat${item.tone === "positive" ? " host-overview-stat--positive" : ""}`}
            >
              <span className="host-overview-stat__medallion" aria-hidden>
                <Icon className="host-overview-stat__icon" />
              </span>
              <p className="host-overview-stat__label">{item.label}</p>
              <p className="host-overview-stat__value">{item.value}</p>
              <span className="host-overview-stat__rule" aria-hidden />
              <span className="host-overview-stat__cta">View details →</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
