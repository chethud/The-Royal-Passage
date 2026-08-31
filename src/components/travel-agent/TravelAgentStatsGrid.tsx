import type { ComponentType, SVGProps } from "react";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  Clock3,
  Compass,
  ShieldCheck,
} from "lucide-react";
import { CornerFiligree } from "@/components/site/RoyalHeritageDecor";
import type { TravelAgentBookingSummary } from "@/lib/api/travel-agent-bookings";

type TravelAgentStatsGridProps = {
  bookings: TravelAgentBookingSummary[];
};

type StatItem = {
  label: string;
  value: string;
  to: "/travel-agent/bookings" | "/travel-agent/catalog";
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

function computeStats(bookings: TravelAgentBookingSummary[]) {
  const today = new Date().toISOString().slice(0, 10);
  let pending = 0;
  let confirmed = 0;
  let completed = 0;
  let todayCount = 0;
  let experiences = 0;
  let homestays = 0;

  for (const row of bookings) {
    if (row.kind === "experience") experiences += 1;
    if (row.kind === "homestay") homestays += 1;
    if (row.bookingStatus === "pending") pending += 1;
    if (row.bookingStatus === "confirmed") confirmed += 1;
    if (row.bookingStatus === "completed") completed += 1;
    if (["pending", "confirmed"].includes(row.bookingStatus)) {
      const day = row.kind === "homestay" ? row.checkIn : row.slotDate;
      if (day?.slice(0, 10) === today) todayCount += 1;
    }
  }

  return {
    total: bookings.length,
    pending,
    confirmed,
    completed,
    todayCount,
    experiences,
    homestays,
  };
}

export function TravelAgentStatsGrid({ bookings }: TravelAgentStatsGridProps) {
  const stats = computeStats(bookings);

  const items: StatItem[] = [
    {
      label: "Total bookings",
      value: String(stats.total),
      to: "/travel-agent/bookings",
      search: { status: "all" },
      Icon: ClipboardList,
    },
    {
      label: "Today",
      value: String(stats.todayCount),
      to: "/travel-agent/bookings",
      search: { status: "today" },
      Icon: CalendarDays,
    },
    {
      label: "Pending",
      value: String(stats.pending),
      to: "/travel-agent/bookings",
      search: { status: "pending" },
      Icon: Clock3,
    },
    {
      label: "Confirmed",
      value: String(stats.confirmed),
      to: "/travel-agent/bookings",
      search: { status: "confirmed" },
      Icon: ShieldCheck,
    },
    {
      label: "Experiences",
      value: String(stats.experiences),
      to: "/travel-agent/catalog",
      Icon: Compass,
    },
    {
      label: "Homestays",
      value: String(stats.homestays),
      to: "/travel-agent/catalog",
      Icon: Building2,
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
