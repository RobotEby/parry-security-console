"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DetectorChart({ data }: { data: Record<string, number> }) {
  const rows = Object.entries(data)
    .map(([detector, count]) => ({ detector, count }))
    .sort((a, b) => b.count - a.count);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="oklch(0.3 0.008 260)" strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          stroke="oklch(0.66 0.012 260)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="detector"
          stroke="oklch(0.66 0.012 260)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip
          cursor={{ fill: "oklch(0.225 0.007 260)" }}
          contentStyle={{
            background: "oklch(0.195 0.006 260)",
            border: "1px solid oklch(0.3 0.008 260)",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" fill="oklch(0.55 0.18 25)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
