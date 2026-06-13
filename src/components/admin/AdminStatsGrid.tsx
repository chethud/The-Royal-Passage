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

  return (
    <div className="space-y-6">
      <StatCardSection title="Platform overview">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ClickableStatCard label="Guests" value={String(stats.totalGuests)} />
          <ClickableStatCard
            label="Hosts"
            value={String(stats.totalHosts)}
            to="/admin/hosts"
          />
          <ClickableStatCard
            label="Published experiences"
            value={String(stats.publishedExperiences)}
            to="/experiences"
          />
          <ClickableStatCard
            label="Pending approvals"
            value={String(stats.pendingExperienceReviews)}
            to="/admin/experiences"
          />
        </div>
      </StatCardSection>

      <StatCardSection
        title="Booking pipeline"
        description="Guest requests, host confirmations, and completed journeys across the marketplace."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <ClickableStatCard
            label="Total bookings"
            value={String(stats.totalBookings)}
            to="/admin/bookings"
            search={{ status: "all" }}
          />
          <ClickableStatCard
            label="Confirmed orders"
            value={String(stats.confirmedBookings)}
            to="/admin/bookings"
            search={{ status: "confirmed" }}
          />
          <ClickableStatCard
            label="Pending requests"
            value={String(stats.pendingBookings)}
            to="/admin/bookings"
            search={{ status: "pending" }}
          />
          <ClickableStatCard
            label="Completed"
            value={String(stats.completedBookings)}
            to="/admin/bookings"
            search={{ status: "completed" }}
          />
          <ClickableStatCard
            label="Cancelled"
            value={String(stats.cancelledBookings)}
            to="/admin/bookings"
            search={{ status: "cancelled" }}
          />
        </div>
      </StatCardSection>

      <StatCardSection
        title="Revenue & payouts"
        description={`All guest payments flow to Royal Passage first. The platform keeps ${commission}% and pays hosts ${100 - commission}% after collection.`}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ClickableStatCard
            label="Gross booking value"
            value={formatMoney(stats.grossBookingValueMinor, sym)}
            hint="All non-cancelled bookings"
            to="/admin/bookings"
            search={{ status: "all" }}
          />
          <ClickableStatCard
            label="Collected from guests"
            value={formatMoney(stats.revenueCollectedMinor, sym)}
            hint="Payment received at venue"
            to="/admin/bookings"
            search={{ payment: "collected" }}
          />
          <ClickableStatCard
            label={`Platform margin (${commission}%)`}
            value={formatMoney(stats.platformRevenueMinor, sym)}
            hint="Royal Passage share on confirmed & completed"
            to="/admin/bookings"
            search={{ status: "confirmed" }}
          />
          <ClickableStatCard
            label={`Host payout due (${100 - commission}%)`}
            value={formatMoney(stats.hostPayoutDueMinor, sym)}
            hint="Owed to hosts after guest payment collected"
            to="/admin/bookings"
            search={{ payment: "collected" }}
          />
          <ClickableStatCard
            label="COD pending collection"
            value={formatMoney(stats.codPendingCollectionMinor, sym)}
            hint="Confirmed bookings awaiting payment at venue"
            to="/admin/bookings"
            search={{ payment: "cod-pending" }}
          />
        </div>
      </StatCardSection>
    </div>
  );
}
