"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { CATEGORY_COLORS } from "@/lib/categoryColors";

interface MonthData {
  name: string;
  income: number;
  expenses: number;
}

interface CategoryData {
  name: string;
  value: number;
}

const FALLBACK_COLORS = [
  "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899",
  "#10b981", "#f97316", "#06b6d4", "#6b7280",
];

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e8e8e8",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  color: "#111111",
  fontFamily: "Inter, sans-serif",
  fontSize: "13px",
  borderRadius: "6px",
  padding: "10px 14px",
};

function fmtTooltip(v: unknown): string {
  return `₪ ${Math.round(Number(v)).toLocaleString("he-IL")}`;
}

function DonutLegend({
  payload,
  pieData,
}: {
  payload?: Array<{ value: string; color: string }>;
  pieData: CategoryData[];
}) {
  if (!payload) return null;
  const amountMap = Object.fromEntries(pieData.map((d) => [d.name, d.value]));

  return (
    <div
      className="flex flex-wrap justify-center"
      style={{ gap: "10px 12px", marginTop: "12px", padding: "0 8px" }}
    >
      {payload.map((entry, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              backgroundColor: entry.color,
              borderRadius: "2px",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: "#6b7280",
              fontSize: "0.75rem",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {entry.value}
          </span>
          <span
            style={{
              color: "#111111",
              fontSize: "0.75rem",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ₪{Math.round(amountMap[entry.value] ?? 0).toLocaleString("he-IL")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SixMonthBarChart({ data }: { data: MonthData[] }) {
  return (
    <div
      className="p-4 md:p-6"
      style={{
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#9ca3af",
          marginBottom: "16px",
        }}
      >
        הכנסות vs הוצאות — 6 חודשים
      </p>
      {/* dir="ltr" prevents RTL page context from flipping recharts SVG axes */}
      <div dir="ltr" className="h-[220px] md:h-[220px]" style={{ height: "220px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="40%" barSize={14}>
            <CartesianGrid
              vertical={false}
              stroke="#f0f0f0"
              strokeDasharray="0"
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "Inter, sans-serif" }}
              axisLine={{ stroke: "#e8e8e8" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "Inter, sans-serif" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => fmtTooltip(v)}
              cursor={{ fill: "rgba(0,0,0,0.03)" }}
            />
            <Bar
              dataKey="income"
              name="הכנסות"
              fill="#00875a"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              name="הוצאות"
              fill="#dc2626"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ExpenseDonutChart({ data }: { data: CategoryData[] }) {
  return (
    <div
      className="p-4 md:p-6"
      style={{
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        minHeight: "280px",
      }}
    >
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "#9ca3af",
          marginBottom: "4px",
        }}
      >
        הוצאות לפי קטגוריה
      </p>
      <MobileAwareDonut data={data} />
    </div>
  );
}

function MobileAwareDonut({ data }: { data: CategoryData[] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const innerR = isMobile ? 58 : 72;
  const outerR = isMobile ? 90 : 110;
  const chartH = isMobile ? 240 : 280;

  return (
    <ResponsiveContainer width="100%" height={chartH}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerR}
          outerRadius={outerR}
          dataKey="value"
          paddingAngle={2}
          labelLine={false}
          label={false}
        >
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={CATEGORY_COLORS[entry.name]?.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtTooltip(v)} />
        <Legend
          content={(props) => (
            <DonutLegend
              payload={props.payload as Array<{ value: string; color: string }>}
              pieData={data}
            />
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
