import Icon from "./Icon";

interface Props {
  avgExpense: number;
  currentMonthExpense: number;
  hasEnoughData: boolean;
}

function fmt(n: number): string {
  return Math.round(Math.abs(n)).toLocaleString("he-IL");
}

export default function AverageExpenseHero({ avgExpense, currentMonthExpense, hasEnoughData }: Props) {
  const diff = currentMonthExpense - avgExpense;
  const isAbove = diff > 0;
  const pct = avgExpense > 0 ? Math.round((Math.abs(diff) / avgExpense) * 100) : 0;

  return (
    <div
      style={{
        background: "var(--card-gradient)",
        border: "1px solid #20272f",
        borderRadius: 28,
        padding: 24,
        textAlign: "center",
        marginBottom: 12,
      }}
    >
      <p style={{ fontSize: 12, color: "#7c8896", marginBottom: 8, fontFamily: "Rubik, sans-serif" }}>
        ממוצע הוצאה חודשית
      </p>

      <p
        dir="ltr"
        style={{
          fontSize: 46,
          fontWeight: 600,
          color: "#f2f5f8",
          lineHeight: 1,
          fontFamily: "Rubik, sans-serif",
          display: "inline-block",
        }}
      >
        ₪{fmt(avgExpense)}
      </p>

      {hasEnoughData && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 99,
              background: isAbove ? "rgba(255,107,107,.12)" : "rgba(52,224,161,.12)",
              color: isAbove ? "#ff8f8f" : "#9fd9c2",
              fontSize: 12,
              fontFamily: "Rubik, sans-serif",
              fontWeight: 500,
            }}
          >
            <Icon name={isAbove ? "trending_up" : "trending_down"} size={16} />
            {isAbove
              ? `החודש ${fmt(currentMonthExpense)} ₪ מעל הממוצע ${pct}%+`
              : `החודש ${fmt(currentMonthExpense)} ₪ מתחת לממוצע ${pct}%-`}
          </span>
        </div>
      )}
    </div>
  );
}
