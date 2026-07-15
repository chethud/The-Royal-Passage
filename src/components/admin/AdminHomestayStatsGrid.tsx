import type { AdminHomestayStats } from "@/lib/api/admin-homestays";
import {
  ClickableStatCard,
  StatCardSection,
} from "@/components/dashboard/ClickableStatCard";
import { formatMoney } from "@/lib/money";

type AdminHomestayStatsGridProps = {
  stats: AdminHomestayStats;
};

export function AdminHomestayStatsGrid({ stats }: AdminHomestayStatsGridProps) {
  const sym = stats.currencySymbol;
  const commission = stats.commissionPercent ?? 10;
  const surface = "light" as const;

  return (
    <div className="space-y-8">
      <StatCardSection title="Homestay overview" surface={surface}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ClickableStatCard
            label="Homestay owners"
            value={String(stats.totalOwners)}
            to="/admin/homestay-owners"
            surface={surface}
          />
          <ClickableStatCard
            label="Published properties"
            value={String(stats.publishedHomestays)}
            to="/homestays/browse"
            surface={surface}
          />
          <ClickableStatCard
            label="Pending approvals"
            value={String(stats.pendingApprovals)}
            to="/admin/homestays"
            surface={surface}
          />
          <ClickableStatCard
            label="Total bookings"
            value={String(stats.totalBookings)}
            surface={surface}
          />
        </div>
      </StatCardSection>

      <StatCardSection
        title="Booking pipeline"
        description="Guest stay requests, owner confirmations, and completed check-outs."
        surface={surface}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <ClickableStatCard
            label="Total bookings"
            value={String(stats.totalBookings)}
            surface={surface}
          />
          <ClickableStatCard
            label="Confirmed stays"
            value={String(stats.confirmedBookings)}
            surface={surface}
          />
          <ClickableStatCard
            label="Pending requests"
            value={String(stats.pendingBookings)}
            surface={surface}
          />
          <ClickableStatCard
            label="Completed"
            value={String(stats.completedBookings)}
            surface={surface}
          />
          <ClickableStatCard
            label="Cancelled"
            value={String(stats.cancelledBookings)}
            surface={surface}
          />
        </div>
      </StatCardSection>

      <StatCardSection
        title="Revenue & payouts"
        description={`Guest payments are collected at the property. The platform keeps ${commission}% and pays owners ${100 - commission}% after collection.`}
        surface={surface}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ClickableStatCard
            label="Gross booking value"
            value={formatMoney(stats.grossBookingValueMinor, sym)}
            hint="All non-cancelled stays"
            surface={surface}
          />
          <ClickableStatCard
            label="Collected from guests"
            value={formatMoney(stats.revenueCollectedMinor, sym)}
            hint="Payment received at property"
            surface={surface}
          />
          <ClickableStatCard
            label={`Platform margin (${commission}%)`}
            value={formatMoney(stats.platformRevenueMinor, sym)}
            hint="Royal Passage share on confirmed & completed"
            surface={surface}
          />
          <ClickableStatCard
            label={`Owner payout due (${100 - commission}%)`}
            value={formatMoney(stats.ownerPayoutDueMinor, sym)}
            hint="Owed to owners after guest payment collected"
            surface={surface}
          />
          <ClickableStatCard
            label="COD pending collection"
            value={formatMoney(stats.codPendingCollectionMinor, sym)}
            hint="Confirmed stays awaiting payment at check-in"
            surface={surface}
          />
        </div>
      </StatCardSection>
    </div>
  );
}
