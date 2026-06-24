interface Props {
  bestMonthLabel: string;
  bestMonthNet: number;
  worstMonthLabel: string;
  worstMonthNet: number;
  avgMonthlyNet: number;
  savingsRate: number;
}

function fmt(n: number): string {
  return Math.round(Math.abs(n)).toLocaleString("he-IL");
}

function StatCard({ label, value, isCurrency, positive }: { label: string; value: number; isCurrency: boolean; positive: boolean }) {
  const color = positive ? "#34e0a1" : "#ff6b6b";
  return (
    <div style={{ flex: 1, background: "#101a16", border: "1px solid #1c3329", borderRadius: 20, padding: "14px 16px" }}>
      <p style={{ fontSize: 11, color: "#5f8a76", marginBottom: 6, fontFamily: "Rubik, sans-serif" }}>{label}</p>
      <p dir="ltr" style={{ fontSize: 20, fontWeight: 600, color, fontFamily: "Rubik, sans-serif" }}>
        {value < 0 ? "−" : ""}{isCurrency ? "₪" : ""}{fmt(value)}{isCurrency ? "" : "%"}
      </p>
    </div>
  );
}

export default function YearStatsGrid({ bestMonthLabel, bestMonthNet, worstMonthLabel, worstMonthNet, avgMonthlyNet, savingsRate }: Props) {
  return (
    <>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <StatCard label={`החודש הטוב ביותר · ${bestMonthLabel}`} value={bestMonthNet} isCurrency positive={bestMonthNet >= 0} />
        <StatCard label={`החודש הגרוע ביותר · ${worstMonthLabel}`} value={worstMonthNet} isCurrency positive={worstMonthNet >= 0} />
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <StatCard label="ממוצע נטו חודשי" value={avgMonthlyNet} isCurrency positive={avgMonthlyNet >= 0} />
        <StatCard label="שיעור חיסכון" value={savingsRate} isCurrency={false} positive={savingsRate >= 0} />
      </div>
    </>
  );
}
