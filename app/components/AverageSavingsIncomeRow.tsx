interface Props {
  avgSavings: number;
  avgIncome: number;
}

function fmt(n: number): string {
  return Math.round(Math.abs(n)).toLocaleString("he-IL");
}

export default function AverageSavingsIncomeRow({ avgSavings, avgIncome }: Props) {
  const savingsColor = avgSavings >= 0 ? "#34e0a1" : "#ff6b6b";

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
      {/* Savings */}
      <div
        style={{
          flex: 1,
          background: "#101a16",
          border: "1px solid #1c3329",
          borderRadius: 20,
          padding: "14px 16px",
        }}
      >
        <p style={{ fontSize: 11, color: "#5f8a76", marginBottom: 6, fontFamily: "Rubik, sans-serif" }}>
          ממוצע חיסכון
        </p>
        <p
          dir="ltr"
          style={{
            fontSize: 23,
            fontWeight: 600,
            color: savingsColor,
            fontFamily: "Rubik, sans-serif",
          }}
        >
          {avgSavings < 0 ? "−" : ""}₪{fmt(avgSavings)}
        </p>
      </div>

      {/* Income */}
      <div
        style={{
          flex: 1,
          background: "#101a16",
          border: "1px solid #1c3329",
          borderRadius: 20,
          padding: "14px 16px",
        }}
      >
        <p style={{ fontSize: 11, color: "#5f8a76", marginBottom: 6, fontFamily: "Rubik, sans-serif" }}>
          ממוצע הכנסה
        </p>
        <p
          dir="ltr"
          style={{
            fontSize: 23,
            fontWeight: 600,
            color: "#34e0a1",
            fontFamily: "Rubik, sans-serif",
          }}
        >
          ₪{fmt(avgIncome)}
        </p>
      </div>
    </div>
  );
}
