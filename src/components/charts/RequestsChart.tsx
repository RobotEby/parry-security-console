"use client";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function RequestsChart({
  allowed,
  blocked,
  rateLimited,
}: {
  allowed: number;
  blocked: number;
  rateLimited: number;
}) {
  const data = [
    { name: "Allowed", value: allowed, fill: "oklch(0.65 0.12 150)" },
    { name: "Blocked", value: blocked, fill: "oklch(0.55 0.2 25)" },
    { name: "Rate limited", value: rateLimited, fill: "oklch(0.78 0.15 75)" },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          stroke="oklch(0.16 0.005 260)"
          strokeWidth={2}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.fill} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "oklch(0.195 0.006 260)",
            border: "1px solid oklch(0.3 0.008 260)",
            borderRadius: 6,
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
