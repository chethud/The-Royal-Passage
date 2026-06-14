import type { AdminStats } from "@/lib/api/admin";
import {
  ClickableStatCard,
  StatCardSection,
} from "@/components/dashboard/ClickableStatCard";
import { formatMoney } from "@/lib/money";

type AdminStatsGridProps = {
  stats: AdminStats;
};

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const sym = stats.currencySymbol;
  const commission = stats.commissionPercent ?? 10;
  const surface = "light" as const;

  return (
    <div className="space-y-8">
      <StatCardSection title="Platform overview" surface={surface}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ClickableStatCard label="Guests" value={String(stats.totalGuests)} surface={surface} />
          <ClickableStatCard
            label="Hosts"
            value={String(stats.totalHosts)}
            to="/admin/hosts"
            surface={surface}
          />
          <ClickableStatCard
            label="Published experiences"
            value={String(stats.publishedExperiences)}
            to="/experiences"
            surface={surface}
          />
          <ClickableStatCard
            label="Pending approvals"
            value={String(stats.pendingExperienceReviews)}
            to="/admin/experiences"
            surface={surface}
          />
        </div>
      </StatCardSection>

      <StatCardSection
        title="Booking pipeline"
        description="Guest requests, host confirmations, and completed journeys across the marketplace."
        surface={surface}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <ClickableStatCard
            label="Total bookings"
            value={String(stats.totalBookings)}
            to="/admin/bookings"
            search={{ status: "all" }}
            surface={surface}
          />
          <ClickableStatCard
            label="Confirmed orders"
            value={String(stats.confirmedBookings)}
            to="/admin/bookings"
            search={{ status: "confirmed" }}
            surface={surface}
          />
          <ClickableStatCard
            label="Pending requests"
            value={String(stats.pendingBookings)}
            to="/admin/bookings"
            search={{ status: "pending" }}
            surface={surface}
          />
          <ClickableStatCard
            label="Completed"
            value={String(stats.completedBookings)}
            to="/admin/bookings"
            search={{ status: "completed" }}
            surface={surface}
          />
          <ClickableStatCard
            label="Cancelled"
            value={String(stats.cancelledBookings)}
            to="/admin/bookings"
            search={{ status: "cancelled" }}
            surface={surface}
          />
        </div>
      </StatCardSection>

      <StatCardSection
        title="Revenue & payouts"
        description={`All guest payments flow to Royal Passage first. The platform keeps ${commission}% and pays hosts ${100 - commission}% after collection.`}
        surface={surface}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ClickableStatCard
            label="Gross booking value"
            value={formatMoney(stats.grossBookingValueMinor, sym)}
            hint="All non-cancelled bookings"
            to="/admin/bookings"
            search={{ status: "all" }}
            surface={surface}
          />
          <ClickableStatCard
            label="Collected from guests"
            value={formatMoney(stats.revenueCollectedMinor, sym)}
            hint="Payment received at venue"
            to="/admin/bookings"
            search={{ payment: "collected" }}
            surface={surface}
          />
          <ClickableStatCard
            label={`Platform margin (${commission}%)`}
            value={formatMoney(stats.platformRevenueMinor, sym)}
            hint="Royal Passage share on confirmed & completed"
            to="/admin/bookings"
            search={{ status: "confirmed" }}
            surface={surface}
          />
          <ClickableStatCard
            label={`Host payout due (${100 - commission}%)`}
            value={formatMoney(stats.hostPayoutDueMinor, sym)}
            hint="Owed to hosts after guest payment collected"
            to="/admin/bookings"
            search={{ payment: "collected" }}
            surface={surface}
          />
          <ClickableStatCard
            label="COD pending collection"
            value={formatMoney(stats.codPendingCollectionMinor, sym)}
            hint="Confirmed bookings awaiting payment at venue"
            to="/admin/bookings"
            search={{ payment: "cod-pending" }}
            surface={surface}
          />
        </div>
      </StatCardSection>
    </div>
  );
}
