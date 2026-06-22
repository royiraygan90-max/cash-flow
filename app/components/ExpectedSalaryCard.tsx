"use client";

interface Props {
  regularHours: number;
  shabbatHours: number;
  gross: number;
  net: number;
  month: number;
  year: number;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("he-IL");
}

function formatHoursAsClock(totalHours: number): string {
  const h = Math.floor(totalHours);
  const m = Math.round((totalHours - h) * 60);
  return m > 0 ? `${h}:${String(m).padStart(2, "0")}` : `${h}`;
}

export default function ExpectedSalaryCard({
  regularHours,
  shabbatHours,
  gross,
  net,
  month,
  year,
}: Props) {
  const totalHours = regularHours + shabbatHours;

  return (
    <div
      style={{
        background: "var(--card-gradient)",
        border: "1px solid #20272f",
        borderRadius: 24,
        padding: 20,
        marginBottom: 12,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: "#6b7785", fontFamily: "Rubik, sans-serif" }}>
          לפי {formatHoursAsClock(totalHours)} שעות שהוזנו
        </span>
        <span style={{ fontSize: 13, color: "#9aa6b4", fontFamily: "Rubik, sans-serif", fontWeight: 500 }}>
          משכורת צפויה
        </span>
      </div>

      {/* Net amount */}
      <p
        style={{
          fontSize: 32,
          fontWeight: 600,
          color: "#34e0a1",
          fontFamily: "Rubik, sans-serif",
          lineHeight: 1,
          direction: "ltr",
          textAlign: "right",
          margin: "0 0 6px",
        }}
      >
        ₪{fmt(net)}
      </p>

      {/* Gross subtext */}
      <p
        style={{
          fontSize: 12,
          color: "#7c8896",
          fontFamily: "Rubik, sans-serif",
          margin: "0 0 14px",
          textAlign: "right",
        }}
      >
        ברוטו: ₪{fmt(gross)}
      </p>

      {/* Link to full breakdown */}
      <a
        href={`/salary?month=${month}&year=${year}`}
        style={{
          fontSize: 12,
          color: "#34e0a1",
          fontFamily: "Rubik, sans-serif",
          textDecoration: "none",
          display: "block",
          textAlign: "left",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}
      >
        לפירוט המלא ←
      </a>
    </div>
  );
}
