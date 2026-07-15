import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { RevenueChart } from "@/components/host/RevenueChart";
import {
  fetchOwnerHomestayRevenue,
  type OwnerRevenuePeriod,
  type OwnerRevenueSummary,
} from "@/lib/api/owner-homestay-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { formatMoney } from "@/lib/money";
import { useHomestayOwnerAccess } from "@/lib/use-homestay-owner-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";
import { dashboardFilterBtnClass } from "@/components/ui/DashboardTable";

const PERIODS = ["month", "monthwise", "months_6", "year"] as const;

type RevenueSearch = {
  period: OwnerRevenuePeriod;
};

function parseRevenueSearch(raw: Record<string, unknown>): RevenueSearch {
  const period = raw.period;
  if (typeof period === "string" && (PERIODS as readonly string[]).includes(period)) {
    return { period: period as OwnerRevenuePeriod };
  }
  return { period: "month" };
}

export const Route = createFileRoute("/homestay/revenue")({
  validateSearch: parseRevenueSearch,
  head: () => ({
    meta: [
      { title: "Homestay revenue — The Royal Passage" },
      {
        name: "description",
        content: "Compare collected and pending COD by day, monthwise, 6 months, and one year.",
      },
    ],
  }),
  component: HomestayOwnerRevenuePage,
});

const PERIOD_OPTIONS: {
  value: OwnerRevenuePeriod;
  label: string;
  summary: string;
  previous: string;
}[] = [
  {
    value: "month",
    label: "This month",
    summary: "Daily collected vs pending COD by check-in date for the current month.",
    previous: "vs last month",
  },
  {
    value: "monthwise",
    label: "Monthwise",
    summary: "Month-by-month collected vs pending COD for this year so far.",
    previous: "vs same months last year",
  },
  {
    value: "months_6",
    label: "6 months",
    summary: "Monthly collected vs pending COD for the last six months.",
    previous: "vs prior 6 months",
  },
  {
    value: "year",
    label: "1 year",
    summary: "Monthly collected vs pending COD for the last twelve months.",
    previous: "vs prior year",
  },
];

function changeLabel(current: number, previous: number) {
  if (previous <= 0 && current <= 0) return "No prior period";
  if (previous <= 0) return "New vs prior period";
  const delta = ((current - previous) / previous) * 100;
  const rounded = Math.round(delta);
  if (rounded === 0) return "Flat vs prior period";
  return `${rounded > 0 ? "+" : ""}${rounded}% vs prior period`;
}

function HomestayOwnerRevenuePage() {
  const { period } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { accessToken, ready, loading } = useHomestayOwnerAccess();
  const [revenue, setRevenue] = useState<OwnerRevenueSummary | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [, startTransition] = useTransition();
  const hasLoadedRef = useRef(false);

  const activePeriod = PERIOD_OPTIONS.find((option) => option.value === period) ?? PERIOD_OPTIONS[0]!;

  const loadPage = useCallback(
    async (nextPeriod: OwnerRevenuePeriod) => {
      if (!accessToken) return;
      const soft = hasLoadedRef.current;
      if (soft) setRefreshing(true);
      else setInitialLoading(true);
      setPageError(null);
      try {
        if (!isApiConfigured()) {
          throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
        }
        const summary = await fetchOwnerHomestayRevenue(accessToken, nextPeriod);
        hasLoadedRef.current = true;
        startTransition(() => {
          setRevenue(summary);
        });
      } catch (err) {
        setPageError(toErrorMessage(err, "Failed to load revenue."));
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (!ready || !accessToken) return;
    void loadPage(period);
  }, [accessToken, period, ready, loadPage]);

  const selectPeriod = (next: OwnerRevenuePeriod) => {
    if (next === period) return;
    void navigate({
      search: (prev) => ({ ...prev, period: next }),
      replace: true,
    });
  };

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <HomestayOwnerDashboardShell
      title="Revenue"
      subtitle="Compare pay-at-property collections and outstanding COD across time."
      showRoleDescription={false}
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => selectPeriod(option.value)}
            aria-pressed={period === option.value}
            disabled={refreshing && period === option.value}
            className={dashboardFilterBtnClass(period === option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {initialLoading && !revenue ? (
        <p className="text-sm text-muted-foreground">Loading revenue…</p>
      ) : pageError && !revenue ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : revenue ? (
        <div
          className={`space-y-8 transition-opacity duration-200 ${refreshing ? "pointer-events-none opacity-55" : "opacity-100"}`}
          aria-busy={refreshing}
        >
          {pageError ? (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {pageError}
            </p>
          ) : null}
          {refreshing ? (
            <p className="text-sm text-muted-foreground">Updating {activePeriod.label.toLowerCase()}…</p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5">
              <div className="eyebrow text-muted-foreground">Collected</div>
              <div className="mt-2 font-display text-3xl text-ember">
                {formatMoney(revenue.collectedMinor, revenue.currencySymbol)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {changeLabel(revenue.collectedMinor, revenue.previousCollectedMinor)} ·{" "}
                {formatMoney(revenue.previousCollectedMinor, revenue.currencySymbol)} prior
              </p>
            </article>
            <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5">
              <div className="eyebrow text-muted-foreground">COD pending</div>
              <div className="mt-2 font-display text-3xl text-ember">
                {formatMoney(revenue.pendingMinor, revenue.currencySymbol)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {changeLabel(revenue.pendingMinor, revenue.previousPendingMinor)} ·{" "}
                {formatMoney(revenue.previousPendingMinor, revenue.currencySymbol)} prior
              </p>
            </article>
            <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5">
              <div className="eyebrow text-muted-foreground">Estimated</div>
              <div className="mt-2 font-display text-3xl text-ember">
                {formatMoney(revenue.estimatedMinor, revenue.currencySymbol)}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {changeLabel(revenue.estimatedMinor, revenue.previousEstimatedMinor)} ·{" "}
                {formatMoney(revenue.previousEstimatedMinor, revenue.currencySymbol)} prior
              </p>
            </article>
          </div>

          <section>
            <h2 className="font-display text-2xl">Revenue breakdown</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activePeriod.summary} ({activePeriod.previous}).
            </p>
            <div className="mt-6">
              <RevenueChart
                key={`${period}-${revenue.grain}-${revenue.week.length}`}
                series={revenue.week}
                currencySymbol={revenue.currencySymbol}
                grain={revenue.grain}
              />
            </div>
          </section>
        </div>
      ) : null}
    </HomestayOwnerDashboardShell>
  );
}
