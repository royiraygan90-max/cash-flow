"use client";

import Icon from "./Icon";

interface Props {
  regularHours: number;
  shabbatHours: number;
  gross: number;
  net: number;
  month: number;
  year: number;
  salaryPaid: boolean;
  salaryPaidAmount: number;
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
  salaryPaid,
  salaryPaidAmount,
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
          {salaryPaid ? "התקבל החודש" : `לפי ${formatHoursAsClock(totalHours)} שעות שהוזנו`}
        </span>
        <span style={{ fontSize: 13, color: "#9aa6b4", fontFamily: "Rubik, sans-serif", fontWeight: 500 }}>
          {salaryPaid ? "משכורת" : "משכורת צפויה"}
        </span>
      </div>

      {salaryPaid ? (
        <>
          {/* Paid state: checkmark + שולם + actual amount */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <span style={{ color: "#34e0a1", display: "inline-flex" }}>
              <Icon name="check_circle" size={20} />
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#34e0a1",
                fontFamily: "Rubik, sans-serif",
              }}
            >
              שולם
            </span>
          </div>
          <p
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#f2f5f8",
              fontFamily: "Rubik, sans-serif",
              lineHeight: 1,
              direction: "ltr",
              textAlign: "right",
              margin: "0 0 14px",
            }}
          >
            ₪{fmt(salaryPaidAmount)}
          </p>
        </>
      ) : (
        <>
          {/* Expected state: computed net + gross subtext */}
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
        </>
      )}

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
