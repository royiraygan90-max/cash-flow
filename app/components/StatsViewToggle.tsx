"use client";

import { useRouter } from "next/navigation";

interface Props {
  currentView: string;
  currentRange: number;
}

const SEGMENTS = [
  { value: "stats", label: "סטטיסטיקה" },
  { value: "compare", label: "השוואה" },
];

export default function StatsViewToggle({ currentView, currentRange }: Props) {
  const router = useRouter();

  function setView(view: string) {
    router.push(`/statistics?view=${view}&range=${currentRange}`);
  }

  return (
    <div
      style={{
        display: "flex",
        background: "#11151b",
        border: "1px solid #1b212a",
        borderRadius: 16,
        padding: 5,
        gap: 4,
        marginBottom: 20,
      }}
    >
      {SEGMENTS.map(({ value, label }) => {
        const active = currentView === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setView(value)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 12,
              border: active ? "1px solid #20272f" : "1px solid transparent",
              background: active ? "#1b2230" : "transparent",
              color: active ? "#f2f5f8" : "#7c8896",
              fontSize: 14,
              fontFamily: "Rubik, sans-serif",
              fontWeight: active ? 500 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
              minHeight: 44,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
