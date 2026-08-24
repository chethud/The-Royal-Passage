import { createFileRoute } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ComponentType,
  type SVGProps,
} from "react";
import { Calculator, Coins, Wallet } from "lucide-react";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { RevenueChart } from "@/components/host/RevenueChart";
import { CornerFiligree, OrnamentalDivider } from "@/components/site/RoyalHeritageDecor";
import {
  fetchOwnerHomestayRevenue,
  type OwnerRevenuePeriod,
  type OwnerRevenueSummary,
} from "@/lib/api/owner-homestay-bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { formatMoney } from "@/lib/money";
import { useHomestayOwnerAccess } from "@/lib/use-homestay-owner-access";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

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

function PanelCorners() {
  return (
    <>
      <CornerFiligree className="host-revenue-panel__corner host-revenue-panel__corner--tl" />
      <CornerFiligree className="host-revenue-panel__corner host-revenue-panel__corner--tr" />
      <CornerFiligree className="host-revenue-panel__corner host-revenue-panel__corner--bl" />
      <CornerFiligree className="host-revenue-panel__corner host-revenue-panel__corner--br" />
    </>
  );
}

function RevenueMetric({
  label,
  value,
  hint,
  Icon,
}: {
  label: string;
  value: string;
  hint: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
  return (
    <article className="host-revenue-metric">
      <span className="host-revenue-metric__medallion" aria-hidden>
        <Icon className="host-revenue-metric__icon" />
      </span>
      <p className="host-revenue-metric__label">{label}</p>
      <p className="host-revenue-metric__value">{value}</p>
      <span className="host-revenue-metric__rule" aria-hidden />
      <p className="host-revenue-metric__hint">{hint}</p>
    </article>
  );
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
      variant="revenue"
      showRoleDescription={false}
    >
      <div className="host-revenue-stack">
        <div className="host-revenue-filters" role="group" aria-label="Revenue period">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => selectPeriod(option.value)}
              aria-pressed={period === option.value}
              disabled={refreshing && period === option.value}
              className={`host-revenue-filter${period === option.value ? " is-active" : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {initialLoading && !revenue ? (
          <div className="host-revenue-panel host-revenue-loading">
            <p>Loading revenue…</p>
          </div>
        ) : pageError && !revenue ? (
          <div className="host-revenue-panel host-revenue-warning">
            <p>{pageError}</p>
          </div>
        ) : revenue ? (
          <div
            className={`host-revenue-content transition-opacity duration-200 ${refreshing ? "pointer-events-none opacity-55" : "opacity-100"}`}
            aria-busy={refreshing}
          >
            {pageError ? (
              <div className="host-revenue-panel host-revenue-warning">
                <p>{pageError}</p>
              </div>
            ) : null}
            {refreshing ? (
              <p className="host-revenue-updating">Updating {activePeriod.label.toLowerCase()}…</p>
            ) : null}

            <div className="host-revenue-panel host-revenue-summary">
              <PanelCorners />
              <div className="host-revenue-summary__grid">
                <RevenueMetric
                  label="Collected"
                  value={formatMoney(revenue.collectedMinor, revenue.currencySymbol)}
                  hint={`${changeLabel(revenue.collectedMinor, revenue.previousCollectedMinor)} · ${formatMoney(revenue.previousCollectedMinor, revenue.currencySymbol)} prior`}
                  Icon={Coins}
                />
                <RevenueMetric
                  label="COD pending"
                  value={formatMoney(revenue.pendingMinor, revenue.currencySymbol)}
                  hint={`${changeLabel(revenue.pendingMinor, revenue.previousPendingMinor)} · ${formatMoney(revenue.previousPendingMinor, revenue.currencySymbol)} prior`}
                  Icon={Wallet}
                />
                <RevenueMetric
                  label="Estimated"
                  value={formatMoney(revenue.estimatedMinor, revenue.currencySymbol)}
                  hint={`${changeLabel(revenue.estimatedMinor, revenue.previousEstimatedMinor)} · ${formatMoney(revenue.previousEstimatedMinor, revenue.currencySymbol)} prior`}
                  Icon={Calculator}
                />
              </div>
            </div>

            <section className="host-revenue-panel host-revenue-breakdown">
              <PanelCorners />
              <div className="host-revenue-breakdown__header">
                <h2 className="host-revenue-breakdown__title">Revenue breakdown</h2>
                <OrnamentalDivider className="host-revenue-breakdown__divider" />
                <p className="host-revenue-breakdown__summary">
                  {activePeriod.summary} ({activePeriod.previous}).
                </p>
              </div>
              <div className="host-revenue-breakdown__chart">
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
      </div>
    </HomestayOwnerDashboardShell>
  );
}
