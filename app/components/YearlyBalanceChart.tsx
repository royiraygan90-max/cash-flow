"use client";

import {
  ComposedChart,
  Bar,
  Line,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface MonthPoint {
  monthIdx: number;
  net: number;
  cumulative: number;
}

const SHORT_MONTHS = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יונ", "יול", "אוג", "ספט", "אוק", "נוב", "דצמ"];

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

export default function YearlyBalanceChart({ data }: { data: MonthPoint[] }) {
  const chartData = data.map((d) => ({ ...d, name: SHORT_MONTHS[d.monthIdx] }));

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
      <p style={{ fontFamily: "Rubik, sans-serif", fontSize: 13, fontWeight: 600, color: "#f2f5f8", marginBottom: 16 }}>
        מאזן מצטבר לאורך השנה
      </p>
      <div dir="ltr" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} barCategoryGap="35%">
            <CartesianGrid vertical={false} stroke="#161b22" strokeDasharray="0" />
            <XAxis dataKey="name" tick={{ fill: "#6b7785", fontSize: 11, fontFamily: "Rubik, sans-serif" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7785", fontSize: 11, fontFamily: "Rubik, sans-serif" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtTooltip(v)} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="net" name="נטו חודשי" radius={[4, 4, 0, 0]} barSize={14}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.net >= 0 ? "#34e0a1" : "#ff6b6b"} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="cumulative" name="מאזן מצטבר" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 3, fill: "#818cf8" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
