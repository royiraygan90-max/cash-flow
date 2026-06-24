"use client";

import { useRouter } from "next/navigation";
import Icon from "./Icon";

interface Props {
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

export default function YearNavigator({ year }: Props) {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        marginTop: 4,
        marginBottom: 16,
      }}
    >
      <button
        onClick={() => router.push(`/report?year=${year - 1}`)}
        aria-label="שנה קודמת"
        style={navBtn}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#f2f5f8"; e.currentTarget.style.background = "#20272f"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#7c8896"; e.currentTarget.style.background = "#1b2230"; }}
      >
        <Icon name="chevron_right" size={18} />
      </button>

      <span style={{ fontSize: 17, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
        {year}
      </span>

      <button
        onClick={() => router.push(`/report?year=${year + 1}`)}
        aria-label="שנה הבאה"
        style={navBtn}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#f2f5f8"; e.currentTarget.style.background = "#20272f"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#7c8896"; e.currentTarget.style.background = "#1b2230"; }}
      >
        <Icon name="chevron_left" size={18} />
      </button>
    </div>
  );
}
