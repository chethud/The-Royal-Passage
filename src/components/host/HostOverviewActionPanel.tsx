import type { ComponentType, ReactNode, SVGProps } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, CalendarDays, Compass, Hourglass } from "lucide-react";
import { CornerFiligree, PalaceSilhouette } from "@/components/site/RoyalHeritageDecor";
import type { BookingListSearch } from "@/lib/dashboard-booking-filters";

type OverviewActionRoute =
  | "/host/bookings"
  | "/homestay/bookings"
  | "/travel-agent/bookings"
  | "/travel-agent/catalog"
  | "/experiences"
  | "/homestays/browse";

type HostOverviewActionPanelProps = {
  title: string;
  subtitle: string;
  emptyMessage: string;
  ctaLabel: string;
  ctaTo: OverviewActionRoute;
  ctaSearch?: BookingListSearch | { status?: string };
  icon: "calendar" | "hourglass" | "compass" | "building";
  children?: ReactNode;
  isEmpty: boolean;
};

const ICONS: Record<HostOverviewActionPanelProps["icon"], ComponentType<SVGProps<SVGSVGElement>>> = {
  calendar: CalendarDays,
  hourglass: Hourglass,
  compass: Compass,
  building: Building2,
};

function PanelCorners() {
  return (
    <>
      <CornerFiligree className="host-overview-panel__corner host-overview-panel__corner--tl" />
      <CornerFiligree className="host-overview-panel__corner host-overview-panel__corner--tr" />
      <CornerFiligree className="host-overview-panel__corner host-overview-panel__corner--bl" />
      <CornerFiligree className="host-overview-panel__corner host-overview-panel__corner--br" />
    </>
  );
}

export function HostOverviewActionPanel({
  title,
  subtitle,
  emptyMessage,
  ctaLabel,
  ctaTo,
  ctaSearch,
  icon,
  children,
  isEmpty,
}: HostOverviewActionPanelProps) {
  const Icon = ICONS[icon];

  return (
    <div className="host-overview-panel host-overview-action">
      <PanelCorners />
      <PalaceSilhouette className="host-overview-action__palace" />

      <div className="host-overview-action__layout">
        <div className="host-overview-action__medallion" aria-hidden>
          <span className="host-overview-action__medallion-ring">
            <Icon className="host-overview-action__medallion-icon" />
          </span>
        </div>

        <div className="host-overview-action__copy">
          <h2 className="host-overview-action__title">{title}</h2>
          <p className="host-overview-action__subtitle">{subtitle}</p>
          {isEmpty ? (
            <p className="host-overview-action__empty">{emptyMessage}</p>
          ) : (
            <div className="host-overview-action__list">{children}</div>
          )}
        </div>

        <div className="host-overview-action__cta-wrap">
          <Link to={ctaTo} search={ctaSearch} className="host-overview-action__cta">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
