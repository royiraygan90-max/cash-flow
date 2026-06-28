"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REFERRAL_BONUS_AMOUNT } from "@/lib/salaryCalc";

interface Props {
  referralCount: number;
  month: number;
  year: number;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("he-IL");
}

const btnStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: "50%",
  background: "#1b2230",
  border: "1px solid #2a3340",
  color: "#9aa6b4",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  lineHeight: 1,
  fontFamily: "Rubik, sans-serif",
  transition: "color 0.15s, background 0.15s",
  flexShrink: 0,
};

export default function ReferralBonusInput({ referralCount: initialCount, month, year }: Props) {
  const [count, setCount] = useState(initialCount);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function updateCount(next: number) {
    const clamped = Math.max(0, next);
    setCount(clamped);
    setSaving(true);
    await fetch("/api/salary-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year, referralCount: clamped }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 13,
        fontFamily: "Rubik, sans-serif",
        direction: "rtl",
        padding: "3px 0",
      }}
    >
      <span style={{ color: saving ? "#6b7785" : "#9aa6b4" }}>בונוס חבר מביא חבר</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, direction: "ltr" }}>
        <button
          style={btnStyle}
          onClick={() => updateCount(count - 1)}
          disabled={saving || count === 0}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f2f5f8"; e.currentTarget.style.background = "#20272f"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#9aa6b4"; e.currentTarget.style.background = "#1b2230"; }}
          aria-label="הפחת בונוס"
        >
          −
        </button>
        <span style={{ color: count > 0 ? "#34e0a1" : "#7c8896", minWidth: 50, textAlign: "center" }}>
          {count > 0 ? `₪${fmt(count * REFERRAL_BONUS_AMOUNT)}` : "—"}
        </span>
        <button
          style={btnStyle}
          onClick={() => updateCount(count + 1)}
          disabled={saving}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f2f5f8"; e.currentTarget.style.background = "#20272f"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#9aa6b4"; e.currentTarget.style.background = "#1b2230"; }}
          aria-label="הוסף בונוס"
        >
          +
        </button>
      </div>
    </div>
  );
}
