"use client";

import { useRouter } from "next/navigation";
import Icon from "./Icon";

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

interface Props {
  month: number;
  year: number;
}

const navBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  background: "#1b2230",
  border: "none",
  color: "#7c8896",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "color 0.15s, background 0.15s",
};

const utilityPill: React.CSSProperties = {
  background: "#161b22",
  border: "1px solid #1f2630",
  borderRadius: 99,
  padding: "7px 14px",
  display: "flex",
  alignItems: "center",
  gap: 6,
  color: "#9aa6b4",
  fontSize: 12,
  fontFamily: "Rubik, sans-serif",
  fontWeight: 500,
  cursor: "pointer",
  transition: "color 0.15s",
};

export default function MonthNavigator({ month, year }: Props) {
  const router = useRouter();

  function navigate(offset: number) {
    const d = new Date(year, month - 1 + offset, 1);
    router.push(`/?month=${d.getMonth() + 1}&year=${d.getFullYear()}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Row 1 — month navigation, centered */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          marginTop: 16,
          marginBottom: 10,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="חודש קודם"
          style={navBtn}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f2f5f8"; e.currentTarget.style.background = "#20272f"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#7c8896"; e.currentTarget.style.background = "#1b2230"; }}
        >
          <Icon name="chevron_right" size={18} />
        </button>

        <span style={{ fontSize: 17, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
          {HEBREW_MONTHS[month - 1]} {year}
        </span>

        <button
          onClick={() => navigate(1)}
          aria-label="חודש הבא"
          style={navBtn}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f2f5f8"; e.currentTarget.style.background = "#20272f"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#7c8896"; e.currentTarget.style.background = "#1b2230"; }}
        >
          <Icon name="chevron_left" size={18} />
        </button>
      </div>

      {/* Row 2 — utility pills */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-start",
          marginBottom: 12,
          padding: "0 2px",
        }}
      >
        <button
          onClick={() => router.push("/shifts")}
          style={utilityPill}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f2f5f8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9aa6b4")}
        >
          <Icon name="schedule" size={14} />
          שעות עבודה
        </button>

        <button
          onClick={() => window.open("/api/export", "_blank")}
          style={utilityPill}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f2f5f8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9aa6b4")}
        >
          <Icon name="download" size={14} />
          ייצוא CSV
        </button>
      </div>
    </div>
  );
}
