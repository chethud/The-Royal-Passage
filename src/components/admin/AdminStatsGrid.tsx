import type { AdminStats } from "@/lib/api/admin";
import {
  ClickableStatCard,
  StatCardSection,
} from "@/components/dashboard/ClickableStatCard";
import { formatMoney } from "@/lib/money";

type AdminStatsGridProps = {
  stats: AdminStats;
};

function growthLabel(value?: number) {
  if (value == null || Number.isNaN(value)) return "—";
  const rounded = Math.round(value * 10) / 10;
  if (rounded > 0) return `+${rounded}%`;
  if (rounded < 0) return `${rounded}%`;
  return "0%";
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const sym = stats.currencySymbol;
  const commission = stats.commissionPercent ?? 10;
  const surface = "light" as const;

  return (
    <div className="space-y-8">
      <StatCardSection
        title="Platform analytics"
        description="GMV, revenue, conversion, and 30-day growth across experience bookings."
        surface={surface}
      >
        <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ClickableStatCard
            label="GMV"
            value={formatMoney(stats.grossBookingValueMinor, sym)}
            hint="Gross booking value (non-cancelled)"
            to="/admin/bookings"
            search={{ status: "all" }}
            surface={surface}
          />
          <ClickableStatCard
            label="Revenue"
            value={formatMoney(stats.platformRevenueMinor, sym)}
            hint={`Platform margin (${commission}%)`}
            to="/admin/bookings"
            search={{ status: "confirmed" }}
            surface={surface}
          />
          <ClickableStatCard
            label="Bookings"
            value={String(stats.totalBookings)}
            to="/admin/bookings"
            search={{ status: "all" }}
            surface={surface}
          />
          <ClickableStatCard
            label="Hosts"
            value={String(stats.totalHosts)}
            to="/admin/profile/users"
            surface={surface}
          />
          <ClickableStatCard
            label="Conversion"
            value={`${stats.conversionRatePercent ?? 0}%`}
            hint="Confirmed + completed ÷ decided bookings"
            to="/admin/bookings"
            search={{ status: "confirmed" }}
            surface={surface}
          />
          <ClickableStatCard
            label="Growth"
            value={growthLabel(stats.bookingGrowthPercent)}
            hint={`Bookings last 30d (${stats.bookingsLast30Days ?? 0}) vs prior 30d`}
            surface={surface}
          />
        </div>
      </StatCardSection>

      <StatCardSection title="Platform overview" surface={surface}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ClickableStatCard label="Guests" value={String(stats.totalGuests)} surface={surface} />
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
          <ClickableStatCard
            label="GMV growth"
            value={growthLabel(stats.gmvGrowthPercent)}
            hint={`Last 30d ${formatMoney(stats.gmvLast30DaysMinor ?? 0, sym)}`}
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
            hint={`Cancel rate ${stats.cancelRatePercent ?? 0}%`}
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
            label="Collected from guests"
            value={formatMoney(stats.revenueCollectedMinor, sym)}
            hint="Payment received at venue"
            to="/admin/bookings"
            search={{ payment: "collected" }}
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
