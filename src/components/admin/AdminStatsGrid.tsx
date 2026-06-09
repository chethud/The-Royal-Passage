import type { AdminStats } from "@/lib/api/admin";
import { formatMoney } from "@/lib/money";

type AdminStatsGridProps = {
  stats: AdminStats;
};

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const sym = stats.currencySymbol;
  const commission = stats.commissionPercent ?? 10;

  const overview = [
    { label: "Guests", value: String(stats.totalGuests) },
    { label: "Hosts", value: String(stats.totalHosts) },
    { label: "Published experiences", value: String(stats.publishedExperiences) },
    { label: "Pending approvals", value: String(stats.pendingExperienceReviews) },
  ];

  const bookings = [
    { label: "Total bookings", value: String(stats.totalBookings) },
    { label: "Confirmed orders", value: String(stats.confirmedBookings) },
    { label: "Pending requests", value: String(stats.pendingBookings) },
    { label: "Completed", value: String(stats.completedBookings) },
    { label: "Cancelled", value: String(stats.cancelledBookings) },
  ];

  const revenue = [
    {
      label: "Gross booking value",
      value: formatMoney(stats.grossBookingValueMinor, sym),
      hint: "All non-cancelled bookings",
    },
    {
      label: "Collected from guests",
      value: formatMoney(stats.revenueCollectedMinor, sym),
      hint: "Payment received at venue",
    },
    {
      label: `Platform margin (${commission}%)`,
      value: formatMoney(stats.platformRevenueMinor, sym),
      hint: "Royal Passage share on confirmed & completed",
    },
    {
      label: `Host payout due (${100 - commission}%)`,
      value: formatMoney(stats.hostPayoutDueMinor, sym),
      hint: "Owed to hosts after guest payment collected",
    },
    {
      label: "COD pending collection",
      value: formatMoney(stats.codPendingCollectionMinor, sym),
      hint: "Confirmed bookings awaiting payment at venue",
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-2xl">Platform overview</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {overview.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Booking pipeline</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Guest requests, host confirmations, and completed journeys across the marketplace.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {bookings.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Revenue & payouts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          All guest payments flow to Royal Passage first. The platform keeps {commission}% and pays
          hosts {100 - commission}% after collection.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {revenue.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} hint={item.hint} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5">
      <div className="eyebrow text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl text-ember">{value}</div>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </article>
  );
}
