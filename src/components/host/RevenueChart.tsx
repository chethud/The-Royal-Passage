import { Calculator } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PalaceSilhouette } from "@/components/site/RoyalHeritageDecor";
import type { HostRevenueDay, HostRevenueGrain } from "@/lib/api/host";
import { formatMoney, minorToMajor } from "@/lib/money";

type RevenuePoint = {
  date: string;
  collectedMinor: number;
  pendingMinor: number;
  estimatedMinor: number;
};

type RevenueChartProps = {
  series: readonly RevenuePoint[] | HostRevenueDay[];
  currencySymbol: string;
  grain: HostRevenueGrain | "day" | "month";
};

const COLORS = {
  collected: "#B88A2A",
  pending: "#8FA58E",
} as const;

function formatAxisMoney(value: number, currencySymbol: string) {
  const major = minorToMajor(value);
  if (major >= 100_000) return `${currencySymbol}${(major / 100_000).toFixed(1)}L`;
  if (major >= 1_000) return `${currencySymbol}${(major / 1_000).toFixed(major >= 10_000 ? 0 : 1)}k`;
  return `${currencySymbol}${major.toLocaleString("en-IN")}`;
}

function formatTick(date: string, grain: HostRevenueGrain) {
  const parsed = new Date(`${date}T12:00:00`);
  if (grain === "month") {
    return parsed.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  }
  return parsed.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatFullLabel(date: string, grain: HostRevenueGrain) {
  const parsed = new Date(`${date}T12:00:00`);
  if (grain === "month") {
    return parsed.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  }
  return parsed.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type TooltipPayloadItem = {
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  payload?: {
    fullLabel?: string;
    collectedMinor?: number;
    pendingMinor?: number;
    estimatedMinor?: number;
  };
};

function RevenueTooltip({
  active,
  payload,
  currencySymbol,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  currencySymbol: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="host-revenue-tooltip">
      <p className="host-revenue-tooltip__title">{point.fullLabel}</p>
      <div className="host-revenue-tooltip__rows">
        <p className="host-revenue-tooltip__row">
          <span>Collected</span>
          <span>{formatMoney(point.collectedMinor ?? 0, currencySymbol)}</span>
        </p>
        <p className="host-revenue-tooltip__row">
          <span>Pending COD</span>
          <span>{formatMoney(point.pendingMinor ?? 0, currencySymbol)}</span>
        </p>
        <p className="host-revenue-tooltip__row">
          <span>Estimated</span>
          <span>{formatMoney(point.estimatedMinor ?? 0, currencySymbol)}</span>
        </p>
      </div>
    </div>
  );
}

export function RevenueChart({ series, currencySymbol, grain }: RevenueChartProps) {
  const data = series.map((point) => ({
    ...point,
    label: formatTick(point.date, grain),
    fullLabel: formatFullLabel(point.date, grain),
  }));

  const hasActivity = data.some(
    (point) => point.collectedMinor > 0 || point.pendingMinor > 0 || point.estimatedMinor > 0,
  );

  if (!hasActivity) {
    return (
      <div className="host-revenue-empty">
        <PalaceSilhouette className="host-revenue-empty__palace" />
        <div className="host-revenue-empty__content">
          <span className="host-revenue-empty__medallion" aria-hidden>
            <Calculator className="host-revenue-empty__icon" />
          </span>
          <p className="host-revenue-empty__text">No revenue in this period yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="host-revenue-chart">
      <div className="host-revenue-chart__surface">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 14, right: 10, left: 4, bottom: 6 }} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke="rgb(184 138 42 / 0.18)" strokeDasharray="3 6" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "rgb(184 138 42 / 0.45)", strokeWidth: 1 }}
              tickMargin={12}
              interval="preserveStartEnd"
              minTickGap={grain === "day" ? 18 : 8}
              tick={{ fill: "#4A1113", fontSize: 11, fontFamily: "var(--font-display)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={58}
              tickMargin={6}
              tickFormatter={(value) => formatAxisMoney(Number(value), currencySymbol)}
              tick={{ fill: "rgb(74 17 19 / 0.62)", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "rgb(184 138 42 / 0.08)" }}
              content={<RevenueTooltip currencySymbol={currencySymbol} />}
            />
            <Bar
              dataKey="collectedMinor"
              name="Collected"
              stackId="revenue"
              fill={COLORS.collected}
              radius={[0, 0, 0, 0]}
              maxBarSize={38}
            />
            <Bar
              dataKey="pendingMinor"
              name="Pending COD"
              stackId="revenue"
              fill={COLORS.pending}
              radius={[5, 5, 0, 0]}
              maxBarSize={38}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="host-revenue-chart__legend">
        <span className="host-revenue-chart__legend-item">
          <span className="host-revenue-chart__swatch" style={{ background: COLORS.collected }} />
          Collected
        </span>
        <span className="host-revenue-chart__legend-item">
          <span className="host-revenue-chart__swatch" style={{ background: COLORS.pending }} />
          Pending COD
        </span>
      </div>
    </div>
  );
}
