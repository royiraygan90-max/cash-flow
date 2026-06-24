import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";

interface Source {
  name: string;
  value: number;
}

function fmt(n: number): string {
  return Math.round(Math.abs(n)).toLocaleString("he-IL");
}

export default function IncomeBySourceCard({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  const total = sources.reduce((s, x) => s + Math.max(x.value, 0), 0);
  const max = Math.max(...sources.map((s) => Math.abs(s.value)), 1);

  return (
    <div style={{ background: "#1b2230", border: "1px solid #20272f", borderRadius: 20, padding: "18px 20px", marginBottom: 12 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#f2f5f8", marginBottom: 16, fontFamily: "Rubik, sans-serif" }}>
        הכנסות לפי מקור
      </p>
      {sources.map((s) => {
        const c = CATEGORY_COLORS[s.name] ?? DEFAULT_CATEGORY_COLOR;
        const pct = total > 0 ? Math.round((Math.max(s.value, 0) / total) * 100) : 0;
        return (
          <div key={s.name} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>{s.name}</span>
              <span dir="ltr" style={{ fontSize: 13, fontWeight: 600, color: s.value >= 0 ? "#f2f5f8" : "#ff8f8f", fontFamily: "Rubik, sans-serif" }}>
                {s.value < 0 ? "−" : ""}₪{fmt(s.value)} <span style={{ color: "#6b7785", fontWeight: 400 }}>· {pct}%</span>
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: "#161b22", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(Math.abs(s.value) / max) * 100}%`, background: s.value >= 0 ? c.color : "#ff6b6b", borderRadius: 99 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
