import type { ComponentType, SVGProps } from "react";
import { Link } from "@tanstack/react-router";
import {
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { CornerFiligree } from "@/components/site/RoyalHeritageDecor";
import type { OwnerDashboardStats } from "@/lib/api/owner-homestay-bookings";
import { formatMoney } from "@/lib/money";

type OwnerHomestayStatsGridProps = {
  stats: OwnerDashboardStats;
};

type StatItem = {
  label: string;
  value: string;
  to: "/homestay/bookings" | "/homestay/properties" | "/homestay/revenue";
  search?: { status?: string };
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

export function OwnerHomestayStatsGrid({ stats }: OwnerHomestayStatsGridProps) {
  const symbol = stats.currencySymbol || "₹";

  const items: StatItem[] = [
    {
      label: "Total bookings",
      value: String(stats.totalBookings),
      to: "/homestay/bookings",
      Icon: ClipboardList,
    },
    {
      label: "Check-ins today",
      value: String(stats.checkInToday),
      to: "/homestay/bookings",
      search: { status: "today" },
      Icon: CalendarDays,
    },
    {
      label: "Pending requests",
      value: String(stats.pendingBookings),
      to: "/homestay/bookings",
      search: { status: "pending" },
      Icon: Clock3,
    },
    {
      label: "Confirmed",
      value: String(stats.confirmedBookings),
      to: "/homestay/bookings",
      search: { status: "confirmed" },
      Icon: ShieldCheck,
    },
    {
      label: "Published properties",
      value: String(stats.publishedHomestays),
      to: "/homestay/properties",
      Icon: Building2,
    },
    {
      label: "Revenue collected",
      value: formatMoney(stats.revenueCollectedMinor, symbol),
      to: "/homestay/revenue",
      Icon: Banknote,
    },
    {
      label: "Pending payment",
      value: formatMoney(stats.revenuePendingMinor, symbol),
      to: "/homestay/revenue",
      Icon: Wallet,
    },
    {
      label: "Completed",
      value: String(stats.completedBookings),
      to: "/homestay/bookings",
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
