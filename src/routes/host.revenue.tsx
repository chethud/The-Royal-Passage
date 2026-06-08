import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { RevenueChart } from "@/components/host/RevenueChart";
import { fetchHostRevenue, type HostRevenueSummary } from "@/lib/api/host";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { formatMoney } from "@/lib/money";
import { useHostAccess } from "@/lib/use-host-access";

export const Route = createFileRoute("/host/revenue")({
  head: () => ({
    meta: [
      { title: "Host revenue — The Royal Passage" },
      { name: "description", content: "COD revenue collected and pending over the last 7 days." },
    ],
  }),
  component: HostRevenuePage,
});

function HostRevenuePage() {
  const { accessToken, ready, loading } = useHostAccess();
  const [revenue, setRevenue] = useState<HostRevenueSummary | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const summary = await fetchHostRevenue(accessToken);
      setRevenue(summary);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load revenue."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  if (loading || !ready) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <HostDashboardShell
      title="Revenue"
      subtitle="Pay-at-venue collections and outstanding COD over the last seven days."
    >
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
              <div className="eyebrow text-muted-foreground">Collected (7 days)</div>
              <div className="mt-2 font-display text-3xl text-ember">
                {formatMoney(revenue.collectedMinor, revenue.currencySymbol)}
              </div>
            </article>
            <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5">
              <div className="eyebrow text-muted-foreground">COD pending</div>
              <div className="mt-2 font-display text-3xl text-ember">
                {formatMoney(revenue.pendingMinor, revenue.currencySymbol)}
              </div>
            </article>
            <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5">
              <div className="eyebrow text-muted-foreground">Estimated (7 days)</div>
              <div className="mt-2 font-display text-3xl text-ember">
                {formatMoney(revenue.estimatedMinor, revenue.currencySymbol)}
              </div>
            </article>
          </div>

          <section>
            <h2 className="font-display text-2xl">Weekly breakdown</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Collected vs pending COD by session date.
            </p>
            <div className="mt-6">
              <RevenueChart week={revenue.week} currencySymbol={revenue.currencySymbol} />
            </div>
          </section>
        </div>
      ) : null}
    </HostDashboardShell>
  );
}
