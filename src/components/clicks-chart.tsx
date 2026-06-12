"use client";

import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

interface ClicksChartProps {
  data: { date: string; count: number }[];
}

export function ClicksChart({ data }: ClicksChartProps) {
  // Fill missing days with 0
  const filled = fillMissingDays(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Clicks — Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={filled}>
            <defs>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              labelFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "long", day: "numeric" })}
              formatter={(v: ValueType | undefined) => [v ?? 0, "Clicks"]}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              fill="url(#colorClicks)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function fillMissingDays(data: { date: string; count: number }[]) {
  const map = Object.fromEntries(data.map((d) => [d.date, d.count]));
  const days = [];

  for (let i = 29; i >= 0; i--) {
    const d    = new Date();
    d.setDate(d.getDate() - i);
    const key  = d.toISOString().split("T")[0];
    days.push({ date: key, count: map[key] ?? 0 });
  }

  return days;
}