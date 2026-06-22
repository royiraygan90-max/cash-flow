import { SalaryBreakdown } from "@/lib/salaryCalc";

interface Props {
  breakdown: SalaryBreakdown;
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
  padding: "4px 0",
};

export default function DeductionsList({ breakdown }: Props) {
  const { incomeTax, bituachLeumiHealth, pension, studyFund, totalDeductions } = breakdown;

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
      <p style={{ fontSize: 13, color: "#7c8896", marginBottom: 10, fontFamily: "Rubik, sans-serif" }}>
        ניכויים
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={rowStyle}>
          <span style={{ color: "#9aa6b4" }}>מס הכנסה</span>
          <span style={{ color: "#ff8f8f", direction: "ltr" }}>−₪{fmt(incomeTax)}</span>
        </div>

        <div style={rowStyle}>
          <span style={{ color: "#9aa6b4" }}>ביטוח לאומי ובריאות</span>
          <span style={{ color: "#ff8f8f", direction: "ltr" }}>−₪{fmt(bituachLeumiHealth)}</span>
        </div>

        <div style={rowStyle}>
          <span style={{ color: "#9aa6b4" }}>פנסיה</span>
          <span style={{ color: "#9aa6b4", direction: "ltr" }}>−₪{fmt(pension)}</span>
        </div>

        <div style={rowStyle}>
          <span style={{ color: "#9aa6b4" }}>קרן השתלמות</span>
          <span style={{ color: "#9aa6b4", direction: "ltr" }}>−₪{fmt(studyFund)}</span>
        </div>

        <div style={{ borderTop: "1px solid #20272f", margin: "8px 0" }} />

        <div style={{ ...rowStyle, fontWeight: 600 }}>
          <span style={{ color: "#f2f5f8" }}>סה״כ ניכויים</span>
          <span style={{ color: "#f2f5f8", direction: "ltr" }}>−₪{fmt(totalDeductions)}</span>
        </div>
      </div>
    </div>
  );
}
