"use client";

import { useRouter } from "next/navigation";
import Icon from "./Icon";

interface Props {
  currentRange: number;
  currentView: string;
}

export default function RangeSelect({ currentRange, currentView }: Props) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(`/statistics?view=${currentView}&range=${e.target.value}`);
  }

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <select
        value={String(currentRange)}
        onChange={handleChange}
        style={{
          background: "#1b2230",
          border: "1px solid #20272f",
          borderRadius: 12,
          padding: "10px 14px 10px 36px",
          color: "#cdd5de",
          fontSize: 13,
          fontFamily: "Rubik, sans-serif",
          appearance: "none",
          WebkitAppearance: "none",
          cursor: "pointer",
          minHeight: 44,
          direction: "rtl",
        }}
      >
        <option value="3">3 חודשים</option>
        <option value="6">6 חודשים</option>
        <option value="12">12 חודשים</option>
      </select>
      <span
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "#cdd5de",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Icon name="expand_more" size={16} />
      </span>
    </div>
  );
}
