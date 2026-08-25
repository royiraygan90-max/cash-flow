import Icon from "./Icon";

interface Props {
  totalIncome: number;
  totalExpenses: number;
  /** Balance projected once this month's remaining expected salary comes in. Omit/null to hide — e.g. when salary already paid in full or there's no salary data yet. */
  projectedBalance?: number | null;
}

function fmt(n: number): string {
  return Math.abs(n).toLocaleString("he-IL");
}

export default function BalanceHeroCard({ totalIncome, totalExpenses, projectedBalance }: Props) {
  const balance = totalIncome - totalExpenses;
  const isPositive = balance > 0;
  const showProjection = projectedBalance !== null && projectedBalance !== undefined;
  const projectedPositive = showProjection && projectedBalance > 0;

  return (
    <div
      style={{
        background: "linear-gradient(155deg, #171d26, #10151c)",
        border: "1px solid #20272f",
        borderRadius: 28,
        padding: 24,
        textAlign: "center",
        marginBottom: 12,
      }}
    >
      <p style={{ fontSize: 12, color: "#7c8896", marginBottom: 8, fontFamily: "Rubik, sans-serif" }}>
        מאזן עד כה החודש
      </p>

      <p
        style={{
          fontSize: 46,
          fontWeight: 600,
          color: isPositive ? "#34e0a1" : "#ff6b6b",
          lineHeight: 1,
          fontFamily: "Rubik, sans-serif",
          direction: "ltr",
          display: "inline-block",
        }}
      >
        {isPositive ? "" : "−"}₪{fmt(balance)}
      </p>

      {/* Status pill */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 99,
            background: isPositive ? "rgba(52,224,161,.12)" : "rgba(255,107,107,.12)",
            color: isPositive ? "#9fd9c2" : "#ff8f8f",
            fontSize: 12,
            fontFamily: "Rubik, sans-serif",
            fontWeight: 500,
          }}
        >
          <Icon name={isPositive ? "trending_up" : "trending_down"} size={16} />
          {isPositive ? "מאזן חיובי החודש" : "הוצאת יותר ממה שנכנס"}
        </span>
      </div>

      {showProjection && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #20272f" }}>
          <p style={{ fontSize: 11, color: "#7c8896", marginBottom: 4, fontFamily: "Rubik, sans-serif" }}>
            צפוי להישאר עם המשכורת
          </p>
          <p
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: projectedPositive ? "#34e0a1" : "#ff6b6b",
              fontFamily: "Rubik, sans-serif",
              direction: "ltr",
            }}
          >
            {projectedPositive ? "" : "−"}₪{fmt(projectedBalance!)}
          </p>
        </div>
      )}
    </div>
  );
}
