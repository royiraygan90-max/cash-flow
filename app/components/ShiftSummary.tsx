import { formatHoursAsClock } from "@/lib/shiftCalc";

interface Props {
  regularHours: number;
  shabbatHours: number;
}

export default function ShiftSummary({ regularHours, shabbatHours }: Props) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
      {/* Regular hours card */}
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
          שעות רגילות
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
          {formatHoursAsClock(regularHours)}
        </p>
      </div>

      {/* Shabbat hours card */}
      <div
        style={{
          flex: 1,
          background: "#1e1830",
          border: "1px solid #2e2350",
          borderRadius: 20,
          padding: "14px 16px",
        }}
      >
        <p style={{ fontSize: 11, color: "#8a7fb8", marginBottom: 6, fontFamily: "Rubik, sans-serif" }}>
          שעות שבת
        </p>
        <p
          style={{
            fontSize: 23,
            fontWeight: 600,
            color: "#a78bfa",
            fontFamily: "Rubik, sans-serif",
            direction: "ltr",
          }}
        >
          {formatHoursAsClock(shabbatHours)}
        </p>
      </div>
    </div>
  );
}
