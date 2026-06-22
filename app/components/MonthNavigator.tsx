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

const pillBtn: React.CSSProperties = {
  background: "#161b22",
  border: "1px solid #1f2630",
  color: "#9aa6b4",
  borderRadius: 99,
  padding: "5px 12px",
  fontSize: 12,
  fontFamily: "Rubik, sans-serif",
  fontWeight: 500,
  cursor: "pointer",
  transition: "color 0.15s, background 0.15s",
};

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
  fontSize: 16,
  transition: "color 0.15s, background 0.15s",
};

export default function MonthNavigator({ month, year }: Props) {
  const router = useRouter();

  function navigate(offset: number) {
    const d = new Date(year, month - 1 + offset, 1);
    router.push(`/?month=${d.getMonth() + 1}&year=${d.getFullYear()}`);
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
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f2f5f8";
            e.currentTarget.style.background = "#20272f";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#7c8896";
            e.currentTarget.style.background = "#1b2230";
          }}
        >
          <Icon name="chevron_right" size={18} />
        </button>

        <span
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: "#f2f5f8",
            fontFamily: "Rubik, sans-serif",
          }}
        >
          {HEBREW_MONTHS[month - 1]} {year}
        </span>

        <button
          onClick={() => navigate(1)}
          aria-label="חודש הבא"
          style={navBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f2f5f8";
            e.currentTarget.style.background = "#20272f";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#7c8896";
            e.currentTarget.style.background = "#1b2230";
          }}
        >
          <Icon name="chevron_left" size={18} />
        </button>
      </div>

      {/* Action pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => router.push("/insights")}
          aria-label="תובנות"
          style={navBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f2f5f8";
            e.currentTarget.style.background = "#20272f";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#7c8896";
            e.currentTarget.style.background = "#1b2230";
          }}
        >
          <Icon name="notifications" size={16} />
        </button>
        <button
          onClick={() => window.open("/api/export", "_blank")}
          aria-label="ייצוא CSV"
          style={pillBtn}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f2f5f8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9aa6b4")}
        >
          ייצוא CSV
        </button>
        <button
          onClick={async () => {
            if (confirm("האם אתה בטוח? פעולה זו תמחק את כל העסקאות לצמיתות.")) {
              await fetch("/api/clear", { method: "DELETE" });
              window.location.reload();
            }
          }}
          aria-label="נקה הכל"
          style={{ ...pillBtn, color: "#ff6b6b", borderColor: "#3a2226" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1c1316")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#161b22")}
        >
          נקה הכל
        </button>
      </div>
    </div>
  );
}
