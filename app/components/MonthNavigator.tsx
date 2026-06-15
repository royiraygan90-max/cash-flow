"use client";

import { useRouter } from "next/navigation";

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

interface Props {
  month: number;
  year: number;
}

export default function MonthNavigator({ month, year }: Props) {
  const router = useRouter();

  function navigate(offset: number) {
    const d = new Date(year, month - 1 + offset, 1);
    router.push(`/?month=${d.getMonth() + 1}&year=${d.getFullYear()}`);
  }

  return (
    <div
      className="flex items-center justify-between rounded-lg"
      style={{
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        marginBottom: "16px",
        marginTop: "24px",
      }}
    >
      <div className="px-4 py-4 md:px-8 md:py-6 flex items-center justify-between w-full">
        <h1
          className="text-[1.25rem] md:text-[1.75rem]"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            color: "#111111",
            letterSpacing: "0.02em",
          }}
        >
          {HEBREW_MONTHS[month - 1]} {year}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            onClick={async () => {
              if (confirm("האם אתה בטוח? פעולה זו תמחק את כל העסקאות לצמיתות.")) {
                await fetch("/api/clear", { method: "DELETE" });
                window.location.reload();
              }
            }}
            aria-label="נקה הכל"
            style={{
              background: "#ffffff",
              border: "1px solid #dc2626",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              cursor: "pointer",
              color: "#dc2626",
              fontSize: "0.8rem",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              padding: "6px 10px",
              borderRadius: "6px",
              marginLeft: "8px",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fff5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            🗑️ נקה הכל
          </button>
          <button
            onClick={() => window.open("/api/export", "_blank")}
            aria-label="ייצוא CSV"
            style={{
              background: "#ffffff",
              border: "1px solid #e8e8e8",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              cursor: "pointer",
              color: "#6b7280",
              fontSize: "0.8rem",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              padding: "6px 10px",
              borderRadius: "6px",
              marginLeft: "8px",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#111111";
              e.currentTarget.style.background = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6b7280";
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            📥 ייצוא CSV
          </button>
          <button
            onClick={() => navigate(-1)}
            aria-label="חודש קודם"
            className="flex items-center justify-center"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              fontSize: "1.1rem",
              lineHeight: 1,
              minWidth: "44px",
              minHeight: "44px",
              borderRadius: "4px",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#111111";
              e.currentTarget.style.background = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6b7280";
              e.currentTarget.style.background = "none";
            }}
          >
            &lt;
          </button>
          <button
            onClick={() => navigate(1)}
            aria-label="חודש הבא"
            className="flex items-center justify-center"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              fontSize: "1.1rem",
              lineHeight: 1,
              minWidth: "44px",
              minHeight: "44px",
              borderRadius: "4px",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#111111";
              e.currentTarget.style.background = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6b7280";
              e.currentTarget.style.background = "none";
            }}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
