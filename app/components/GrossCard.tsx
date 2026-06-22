import { SalaryBreakdown } from "@/lib/salaryCalc";

interface Props {
  breakdown: SalaryBreakdown;
  shabbatHours: number;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("he-IL");
}

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 13,
  fontFamily: "Rubik, sans-serif",
  direction: "rtl",
  padding: "3px 0",
};

export default function GrossCard({ breakdown, shabbatHours }: Props) {
  const { regularPay, shabbatPay, basePay, bonus, travel, gross } = breakdown;

  return (
    <div
      style={{
        background: "var(--card-gradient)",
        border: "1px solid #20272f",
        borderRadius: 28,
        padding: 24,
        marginBottom: 12,
      }}
    >
      <p style={{ fontSize: 12, color: "#7c8896", marginBottom: 6, fontFamily: "Rubik, sans-serif" }}>
        שכר ברוטו
      </p>
      <p
        style={{
          fontSize: 38,
          fontWeight: 600,
          color: "#f2f5f8",
          fontFamily: "Rubik, sans-serif",
          lineHeight: 1.1,
          direction: "ltr",
          marginBottom: 20,
        }}
      >
        ₪{fmt(gross)}
      </p>

      {/* Breakdown rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={rowStyle}>
          <span style={{ color: "#9aa6b4" }}>שכר בסיס (רגיל)</span>
          <span style={{ color: "#f2f5f8", direction: "ltr" }}>₪{fmt(regularPay)}</span>
        </div>

        {shabbatHours > 0 && (
          <div style={rowStyle}>
            <span style={{ color: "#9aa6b4" }}>תוספת שבת</span>
            <span style={{ color: "#a78bfa", direction: "ltr" }}>₪{fmt(shabbatPay)}</span>
          </div>
        )}

        <div style={rowStyle}>
          <span style={{ color: "#9aa6b4" }}>בונוס קבוע</span>
          <span style={{ color: "#f2f5f8", direction: "ltr" }}>₪{fmt(bonus)}</span>
        </div>

        <div style={rowStyle}>
          <span style={{ color: "#9aa6b4" }}>נסיעות</span>
          <span style={{ color: "#f2f5f8", direction: "ltr" }}>₪{fmt(travel)}</span>
        </div>

        <div style={{ borderTop: "1px solid #20272f", margin: "8px 0" }} />

        <div style={{ ...rowStyle, fontWeight: 600 }}>
          <span style={{ color: "#f2f5f8" }}>ברוטו</span>
          <span style={{ color: "#f2f5f8", direction: "ltr" }}>₪{fmt(gross)}</span>
        </div>
      </div>
    </div>
  );
}
