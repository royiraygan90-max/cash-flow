"use client";

import { useRouter } from "next/navigation";
import { formatMonthLabel } from "@/lib/hebrewDates";
import Icon from "./Icon";

interface Props {
  monthA: string;
  monthB: string;
  availableMonths: string[];
  currentRange: number;
}

function parseKey(key: string): [number, number] {
  const [y, m] = key.split("-").map(Number);
  return [y, m];
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "#161b22",
  border: "1px solid #1f2630",
  borderRadius: 14,
  padding: "10px 16px 10px 36px",
  color: "#f2f5f8",
  fontSize: 14,
  fontFamily: "Rubik, sans-serif",
  fontWeight: 500,
  appearance: "none",
  WebkitAppearance: "none",
  cursor: "pointer",
  minHeight: 44,
  direction: "rtl",
};

export default function MonthCompareSelector({ monthA, monthB, availableMonths, currentRange }: Props) {
  const router = useRouter();

  function update(newA: string, newB: string) {
    router.push(`/statistics?view=compare&range=${currentRange}&monthA=${newA}&monthB=${newB}`);
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          direction: "rtl",
        }}
      >
        {/* RIGHT in RTL: monthA */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: "#7c8896", marginBottom: 6, fontFamily: "Rubik, sans-serif" }}>
            חודש נוכחי
          </p>
          <div style={{ position: "relative" }}>
            <select value={monthA} onChange={(e) => update(e.target.value, monthB)} style={selectStyle}>
              {availableMonths.map((key) => {
                const [y, m] = parseKey(key);
                return (
                  <option key={key} value={key}>
                    {formatMonthLabel(y, m)}
                  </option>
                );
              })}
            </select>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#9aa6b4",
                display: "flex",
              }}
            >
              <Icon name="expand_more" size={16} />
            </span>
          </div>
        </div>

        {/* Center connector */}
        <div
          style={{
            paddingBottom: 10,
            flexShrink: 0,
            color: "#5c6776",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Icon name="compare_arrows" size={20} />
        </div>

        {/* LEFT in RTL: monthB */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: "#7c8896", marginBottom: 6, fontFamily: "Rubik, sans-serif" }}>
            חודש קודם
          </p>
          <div style={{ position: "relative" }}>
            <select value={monthB} onChange={(e) => update(monthA, e.target.value)} style={selectStyle}>
              {availableMonths.map((key) => {
                const [y, m] = parseKey(key);
                return (
                  <option key={key} value={key}>
                    {formatMonthLabel(y, m)}
                  </option>
                );
              })}
            </select>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#9aa6b4",
                display: "flex",
              }}
            >
              <Icon name="expand_more" size={16} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
