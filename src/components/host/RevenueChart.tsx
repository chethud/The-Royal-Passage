import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HostRevenueDay, HostRevenueGrain } from "@/lib/api/host";
import { formatMoney, minorToMajor } from "@/lib/money";

type RevenueChartProps = {
  series: HostRevenueDay[];
  currencySymbol: string;
  grain: HostRevenueGrain;
};

const COLORS = {
  collected: "#E0B86A",
  pending: "#F0E2C4",
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
    <div className="rounded-md border border-[rgb(200_162_90/0.45)] bg-[#FEF9E7] px-3 py-2 text-xs text-[#2A0000] shadow-md">
      <p className="mb-1.5 font-medium">{point.fullLabel}</p>
      <div className="space-y-1">
        <p className="flex justify-between gap-6">
          <span>Collected</span>
          <span className="tabular-nums font-medium">
            {formatMoney(point.collectedMinor ?? 0, currencySymbol)}
          </span>
        </p>
        <p className="flex justify-between gap-6">
          <span>Pending COD</span>
          <span className="tabular-nums font-medium">
            {formatMoney(point.pendingMinor ?? 0, currencySymbol)}
          </span>
        </p>
        <p className="flex justify-between gap-6">
          <span>Estimated</span>
          <span className="tabular-nums font-medium">
            {formatMoney(point.estimatedMinor ?? 0, currencySymbol)}
          </span>
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
      <div className="rounded-md border border-[rgb(200_162_90/0.28)] bg-[rgb(254_249_231/0.08)] px-5 py-10 text-center text-sm text-[#E8DCC8]/80">
        No revenue in this period yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-[340px] w-full rounded-md border border-[rgb(200_162_90/0.28)] bg-[rgb(254_249_231/0.06)] p-3 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 8, left: 4, bottom: 4 }} barCategoryGap="16%">
            <CartesianGrid vertical={false} stroke="rgb(200 162 90 / 0.28)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval="preserveStartEnd"
              minTickGap={grain === "day" ? 18 : 8}
              tick={{ fill: "#E8DCC8", fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={58}
              tickMargin={6}
              tickFormatter={(value) => formatAxisMoney(Number(value), currencySymbol)}
              tick={{ fill: "#E8DCC8", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "rgb(200 162 90 / 0.12)" }}
              content={<RevenueTooltip currencySymbol={currencySymbol} />}
            />
            <Bar
              dataKey="collectedMinor"
              name="Collected"
              stackId="revenue"
              fill={COLORS.collected}
              radius={[0, 0, 0, 0]}
              maxBarSize={42}
            />
            <Bar
              dataKey="pendingMinor"
              name="Pending COD"
              stackId="revenue"
              fill={COLORS.pending}
              radius={[4, 4, 0, 0]}
              maxBarSize={42}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-[#E8DCC8]/85">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS.collected }} />
          Collected
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS.pending }} />
          Pending COD
        </span>
      </div>
    </div>
  );
}
