import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { HostRevenueDay } from "@/lib/api/host";
import { formatMoney, minorToMajor } from "@/lib/money";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type RevenueChartProps = {
  week: HostRevenueDay[];
  currencySymbol: string;
};

const chartConfig = {
  collectedMinor: {
    label: "Collected",
    color: "#C8A25A",
  },
  pendingMinor: {
    label: "Pending COD",
    color: "#9A5B4A",
  },
  estimatedMinor: {
    label: "Estimated",
    color: "#7A8F6E",
  },
} satisfies ChartConfig;

function formatDayLabel(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function formatFullDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAxisMoney(value: number, currencySymbol: string) {
  const major = minorToMajor(value);
  if (major >= 100_000) return `${currencySymbol}${(major / 100_000).toFixed(1)}L`;
  if (major >= 1_000) return `${currencySymbol}${(major / 1_000).toFixed(major >= 10_000 ? 0 : 1)}k`;
  return `${currencySymbol}${major.toLocaleString("en-IN")}`;
}

export function RevenueChart({ week, currencySymbol }: RevenueChartProps) {
  const data = week.map((day) => ({
    ...day,
    label: formatDayLabel(day.date),
    fullDate: formatFullDate(day.date),
    dayTotalMinor: day.collectedMinor + day.pendingMinor,
  }));

  const hasActivity = data.some(
    (day) => day.collectedMinor > 0 || day.pendingMinor > 0 || day.estimatedMinor > 0,
  );

  if (!hasActivity) {
    return (
      <div className="rounded-md border border-[oklch(0.88_0.08_86_/_0.2)] bg-[oklch(0.97_0.02_90_/_0.55)] px-5 py-10 text-center text-sm text-muted-foreground">
        No collected, pending, or estimated revenue in the last 7 days yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ChartContainer config={chartConfig} className="aspect-auto min-h-[320px] w-full">
        <BarChart
          data={data}
          margin={{ left: 4, right: 8, top: 12, bottom: 4 }}
          barCategoryGap="18%"
          barGap={4}
        >
          <CartesianGrid vertical={false} stroke="oklch(0.72 0.1 78 / 0.22)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            interval={0}
            tick={{ fill: "oklch(0.42 0.04 40)", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tickMargin={6}
            tickFormatter={(value) => formatAxisMoney(Number(value), currencySymbol)}
            tick={{ fill: "oklch(0.42 0.04 40)", fontSize: 11 }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                className="border-[oklch(0.72_0.1_78_/_0.35)] bg-[#FEF9E7] text-[#2A0000] shadow-md"
                labelFormatter={(_, payload) => {
                  const day = payload?.[0]?.payload as { fullDate?: string } | undefined;
                  return day?.fullDate ?? "";
                }}
                formatter={(value, name) => {
                  const key = String(name);
                  const label =
                    key === "collectedMinor"
                      ? "Collected"
                      : key === "pendingMinor"
                        ? "Pending COD"
                        : key === "estimatedMinor"
                          ? "Estimated"
                          : key;
                  return (
                    <div className="flex w-full items-center justify-between gap-6">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium tabular-nums text-foreground">
                        {formatMoney(Number(value), currencySymbol)}
                      </span>
                    </div>
                  );
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="collectedMinor"
            name="collectedMinor"
            fill="var(--color-collectedMinor)"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey="pendingMinor"
            name="pendingMinor"
            fill="var(--color-pendingMinor)"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey="estimatedMinor"
            name="estimatedMinor"
            fill="var(--color-estimatedMinor)"
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ChartContainer>

      <div className="overflow-x-auto rounded-md border border-[oklch(0.88_0.08_86_/_0.2)]">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-[oklch(0.88_0.08_86_/_0.2)] bg-[oklch(0.97_0.02_90_/_0.55)] text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Day</th>
              <th className="px-4 py-3 font-medium">Collected</th>
              <th className="px-4 py-3 font-medium">Pending COD</th>
              <th className="px-4 py-3 font-medium">Estimated</th>
              <th className="px-4 py-3 font-medium">Collected + pending</th>
            </tr>
          </thead>
          <tbody>
            {data.map((day) => (
              <tr
                key={day.date}
                className="border-b border-[oklch(0.88_0.08_86_/_0.12)] last:border-0"
              >
                <td className="px-4 py-3 font-medium text-foreground">{day.label}</td>
                <td className="px-4 py-3 tabular-nums">
                  {formatMoney(day.collectedMinor, currencySymbol)}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatMoney(day.pendingMinor, currencySymbol)}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatMoney(day.estimatedMinor, currencySymbol)}
                </td>
                <td className="px-4 py-3 tabular-nums font-medium">
                  {formatMoney(day.dayTotalMinor, currencySymbol)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
