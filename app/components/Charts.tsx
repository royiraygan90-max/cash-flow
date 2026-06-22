"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface MonthData {
  name: string;
  income: number;
  expenses: number;
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "#1b2230",
  border: "1px solid #20272f",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  color: "#f2f5f8",
  fontFamily: "Rubik, sans-serif",
  fontSize: 13,
  borderRadius: 10,
  padding: "10px 14px",
};

function fmtTooltip(v: unknown): string {
  return `₪ ${Math.round(Number(v)).toLocaleString("he-IL")}`;
}

export function SixMonthBarChart({ data }: { data: MonthData[] }) {
  return (
    <div
      style={{
        background: "#1b2230",
        border: "1px solid #20272f",
        borderRadius: 20,
        padding: "18px 20px",
        marginBottom: 12,
      }}
    >
      <p
        style={{
          fontFamily: "Rubik, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "#f2f5f8",
          marginBottom: 16,
        }}
      >
        הכנסות vs הוצאות — 6 חודשים
      </p>
      <div dir="ltr" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="40%" barSize={12}>
            <CartesianGrid vertical={false} stroke="#161b22" strokeDasharray="0" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7785", fontSize: 11, fontFamily: "Rubik, sans-serif" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7785", fontSize: 11, fontFamily: "Rubik, sans-serif" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => fmtTooltip(v)}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="income"   name="הכנסות" fill="#34e0a1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="הוצאות" fill="#ff6b6b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
