import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import type { HostRevenueDay } from "@/lib/api/host";
import { formatMoney } from "@/lib/money";
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
    color: "hsl(var(--chart-1))",
  },
  pendingMinor: {
    label: "Pending COD",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

function formatDayLabel(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return parsed.toLocaleDateString("en-IN", { weekday: "short" });
}

export function RevenueChart({ week, currencySymbol }: RevenueChartProps) {
  const data = week.map((day) => ({
    ...day,
    label: formatDayLabel(day.date),
  }));

  return (
    <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
      <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <span>
                  {name === "collectedMinor" ? "Collected" : "Pending"}:{" "}
                  {formatMoney(Number(value), currencySymbol)}
                </span>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="collectedMinor" fill="var(--color-collectedMinor)" radius={4} />
        <Bar dataKey="pendingMinor" fill="var(--color-pendingMinor)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
