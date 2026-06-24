import Icon from "./Icon";

interface Props {
  hasPrevYearData: boolean;
  prevYear: number;
  rows: { label: string; current: number; previous: number }[];
}

function fmt(n: number): string {
  return Math.round(Math.abs(n)).toLocaleString("he-IL");
}

export default function YearCompareCard({ hasPrevYearData, prevYear, rows }: Props) {
  if (!hasPrevYearData) return null;

  return (
    <div style={{ background: "#1b2230", border: "1px solid #20272f", borderRadius: 20, padding: "18px 20px", marginBottom: 12 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#f2f5f8", marginBottom: 16, fontFamily: "Rubik, sans-serif" }}>
        בהשוואה ל-{prevYear}
      </p>
      {rows.map((r) => {
        const pct = r.previous !== 0 ? ((r.current - r.previous) / Math.abs(r.previous)) * 100 : 0;
        const isUp = pct >= 0;
        return (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #161b22" }}>
            <span style={{ fontSize: 13, color: "#9aa6b4", fontFamily: "Rubik, sans-serif" }}>{r.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span dir="ltr" style={{ fontSize: 13, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>₪{fmt(r.current)}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11, color: isUp ? "#34e0a1" : "#ff6b6b", fontFamily: "Rubik, sans-serif" }}>
                <Icon name={isUp ? "trending_up" : "trending_down"} size={12} />
                {Math.abs(Math.round(pct))}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
