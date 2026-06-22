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

export default function SalaryMonthNav({ month, year }: Props) {
  const router = useRouter();

  function navigate(offset: number) {
    const d = new Date(year, month - 1 + offset, 1);
    router.push(`/salary?month=${d.getMonth() + 1}&year=${d.getFullYear()}`);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        marginTop: 16,
        padding: "0 2px",
        direction: "rtl",
      }}
    >
      {/* Month label + prev/next */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

      {/* Link to shifts page */}
      <a
        href={`/shifts?month=${month}&year=${year}`}
        style={{
          fontSize: 12,
          color: "#7c8896",
          fontFamily: "Rubik, sans-serif",
          textDecoration: "none",
          cursor: "pointer",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; (e.currentTarget as HTMLAnchorElement).style.color = "#9aa6b4"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; (e.currentTarget as HTMLAnchorElement).style.color = "#7c8896"; }}
      >
        שעות עבודה ←
      </a>
    </div>
  );
}
