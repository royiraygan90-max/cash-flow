import Icon from "./Icon";

interface Props {
  expense: number;
  income: number;
}

export default function TradingPnlCard({ expense, income }: Props) {
  const net = income - expense;
  const netPositive = net >= 0;
  const netColor = netPositive ? "#34e0a1" : "#ff6b6b";

  return (
    <div
      style={{
        background: "#11151b",
        border: "1px solid #1b212a",
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        direction: "rtl",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "#22d3ee22",
            border: "1px solid #22d3ee44",
            color: "#22d3ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="candlestick_chart" size={18} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
          מסחר החודש
        </span>
      </div>

      {/* Expense / Income columns */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            flex: 1,
            background: "#0d1014",
            borderRadius: 12,
            padding: "12px 14px",
          }}
        >
          <p style={{ fontSize: 12, color: "#9aa6b4", fontFamily: "Rubik, sans-serif", marginBottom: 4 }}>
            הוצאות
          </p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#ff8f8f",
              fontFamily: "Rubik, sans-serif",
              direction: "ltr",
              textAlign: "left",
            }}
          >
            {expense.toLocaleString()} ₪
          </p>
        </div>
        <div
          style={{
            flex: 1,
            background: "#0d1014",
            borderRadius: 12,
            padding: "12px 14px",
          }}
        >
          <p style={{ fontSize: 12, color: "#9aa6b4", fontFamily: "Rubik, sans-serif", marginBottom: 4 }}>
            הכנסות
          </p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#34e0a1",
              fontFamily: "Rubik, sans-serif",
              direction: "ltr",
              textAlign: "left",
            }}
          >
            {income.toLocaleString()} ₪
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #1b212a", marginBottom: 14 }} />

      {/* Net row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: netColor,
            fontFamily: "Rubik, sans-serif",
            direction: "ltr",
          }}
        >
          {netPositive ? "+" : ""}
          {net.toLocaleString()} ₪
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>נטו</span>
          <div style={{ color: netColor, display: "flex" }}>
            <Icon name={netPositive ? "trending_up" : "trending_down"} size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}
