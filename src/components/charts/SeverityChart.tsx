"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

const SEV_ORDER = ["low", "medium", "high", "critical"] as const;
const COLORS: Record<string, string> = {
  low: "oklch(0.6 0.02 250)",
  medium: "oklch(0.78 0.15 75)",
  high: "oklch(0.68 0.18 40)",
  critical: "oklch(0.55 0.2 25)",
};

export function SeverityChart({ data }: { data: Record<string, number> }) {
  const rows = SEV_ORDER.map((k) => ({ severity: k, count: data[k] ?? 0 }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="oklch(0.3 0.008 260)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="severity"
          stroke="oklch(0.66 0.012 260)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="oklch(0.66 0.012 260)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
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
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {rows.map((r) => (
            <Cell key={r.severity} fill={COLORS[r.severity]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
