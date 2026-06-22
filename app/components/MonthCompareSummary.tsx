import Icon from "./Icon";

interface Totals {
  income: number;
  expense: number;
  net: number;
}

interface Props {
  totalsA: Totals;
  totalsB: Totals;
}

function fmt(n: number): string {
  const abs = Math.round(Math.abs(n)).toLocaleString("he-IL");
  return `${n < 0 ? "−" : ""}₪${abs}`;
}

function computePct(a: number, b: number): number | null {
  return b === 0 ? null : ((a - b) / b) * 100;
}

export default function MonthCompareSummary({ totalsA, totalsB }: Props) {
  const rows = [
    { label: "הכנסות", a: totalsA.income, b: totalsB.income, goodIfAGreater: true },
    { label: "הוצאות", a: totalsA.expense, b: totalsB.expense, goodIfAGreater: false },
    { label: "מאזן",   a: totalsA.net,     b: totalsB.net,     goodIfAGreater: true },
  ];

  return (
    <div
      style={{
        background: "#1b2230",
        border: "1px solid #20272f",
        borderRadius: 20,
        padding: "18px 20px",
        marginBottom: 12,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {rows.map(({ label, a, b, goodIfAGreater }) => {
        const pct = computePct(a, b);
        const aIsGood = goodIfAGreater ? a > b : a < b;
        const aIsBad  = goodIfAGreater ? a < b : a > b;
        const color   = pct === null
          ? "#9aa6b4"
          : aIsGood ? "#34e0a1"
          : aIsBad  ? "#ff6b6b"
          : "#9aa6b4";
        const pctAbs  = pct !== null ? Math.round(Math.abs(pct)) : null;
        const pctText = pct === null ? "—" : `${pctAbs}%`;
        const trending = pct !== null && a !== b ? (a > b ? "trending_up" : "trending_down") : null;

        return (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              direction: "rtl",
              gap: 8,
            }}
          >
            {/* RIGHT: label */}
            <span
              style={{
                flex: "0 0 52px",
                fontSize: 13,
                color: "#cdd5de",
                fontFamily: "Rubik, sans-serif",
              }}
            >
              {label}
            </span>

            {/* MIDDLE: B ◂ A (dir ltr) */}
            <span
              dir="ltr"
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 14,
                fontWeight: 600,
                color: "#f2f5f8",
                fontFamily: "Rubik, sans-serif",
              }}
            >
              {fmt(b)} ◂ {fmt(a)}
            </span>

            {/* LEFT: pct badge */}
            <span
              style={{
                flex: "0 0 52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 3,
                fontSize: 12,
                color,
                fontFamily: "Rubik, sans-serif",
                fontWeight: 500,
                direction: "ltr",
              }}
            >
              {trending && <Icon name={trending} size={14} />}
              {pctText}
            </span>
          </div>
        );
      })}
    </div>
  );
}
