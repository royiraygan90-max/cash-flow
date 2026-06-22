interface Props {
  totalIncome: number;
  totalExpenses: number;
}

function fmt(n: number): string {
  return n.toLocaleString("he-IL");
}

export default function InOutRow({ totalIncome, totalExpenses }: Props) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
      {/* Income card */}
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
          נכנס עד כה
        </p>
        <p
          style={{
            fontSize: 23,
            fontWeight: 600,
            color: "#34e0a1",
            fontFamily: "Rubik, sans-serif",
            direction: "ltr",
          }}
        >
          ₪{fmt(totalIncome)}
        </p>
      </div>

      {/* Expense card */}
      <div
        style={{
          flex: 1,
          background: "#1c1316",
          border: "1px solid #3a2226",
          borderRadius: 20,
          padding: "14px 16px",
        }}
      >
        <p style={{ fontSize: 11, color: "#a36a6a", marginBottom: 6, fontFamily: "Rubik, sans-serif" }}>
          יצא עד כה
        </p>
        <p
          style={{
            fontSize: 23,
            fontWeight: 600,
            color: "#ff6b6b",
            fontFamily: "Rubik, sans-serif",
            direction: "ltr",
          }}
        >
          ₪{fmt(totalExpenses)}
        </p>
      </div>
    </div>
  );
}
