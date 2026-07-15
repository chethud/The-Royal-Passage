import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { RevenueChart } from "@/components/host/RevenueChart";
import {
  fetchHostRevenue,
  type HostRevenuePeriod,
  type HostRevenueSummary,
} from "@/lib/api/host";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { formatMoney } from "@/lib/money";
import { useHostAccess } from "@/lib/use-host-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";
import { dashboardFilterBtnClass } from "@/components/ui/DashboardTable";

export const Route = createFileRoute("/host/revenue")({
  head: () => ({
    meta: [
      { title: "Host revenue — The Royal Passage" },
      {
        name: "description",
        content: "Compare collected and pending COD across this month, 6 months, and one year.",
      },
    ],
  }),
  component: HostRevenuePage,
});

const PERIOD_OPTIONS: { value: HostRevenuePeriod; label: string; summary: string; previous: string }[] = [
  {
    value: "month",
    label: "This month",
    summary: "Daily collected vs pending COD for the current month.",
    previous: "vs last month",
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

function HostRevenuePage() {
  const { accessToken, ready, loading } = useHostAccess();
  const [period, setPeriod] = useState<HostRevenuePeriod>("month");
  const [revenue, setRevenue] = useState<HostRevenueSummary | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const activePeriod = PERIOD_OPTIONS.find((option) => option.value === period) ?? PERIOD_OPTIONS[0]!;

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const summary = await fetchHostRevenue(accessToken, period);
      setRevenue(summary);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load revenue."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken, period]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  if (loading || !ready) {
    return <PageLoadingGate />;
  }

  return (
    <HostDashboardShell
      title="Revenue"
      subtitle="Compare pay-at-venue collections and outstanding COD across time."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPeriod(option.value)}
            className={dashboardFilterBtnClass(period === option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading revenue…</p>
      ) : pageError ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : revenue ? (
        <div className="space-y-8">
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
                series={revenue.week}
                currencySymbol={revenue.currencySymbol}
                grain={revenue.grain}
              />
            </div>
          </section>
        </div>
      ) : null}
    </HostDashboardShell>
  );
}
