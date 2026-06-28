"use client";

import { useRouter, useSearchParams } from "next/navigation";
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

export default function ReferralBonusInput({ referralCount, month, year }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setCount(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", String(month));
    params.set("year", String(year));
    if (next > 0) {
      params.set("referrals", String(next));
    } else {
      params.delete("referrals");
    }
    router.push(`/salary?${params.toString()}`);
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
      <span style={{ color: "#9aa6b4" }}>בונוס חבר מביא חבר</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8, direction: "ltr" }}>
        <button
          style={btnStyle}
          onClick={() => setCount(Math.max(0, referralCount - 1))}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f2f5f8"; e.currentTarget.style.background = "#20272f"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#9aa6b4"; e.currentTarget.style.background = "#1b2230"; }}
          aria-label="הפחת בונוס"
        >
          −
        </button>
        <span style={{ color: referralCount > 0 ? "#34e0a1" : "#7c8896", minWidth: 28, textAlign: "center" }}>
          {referralCount > 0 ? `₪${fmt(referralCount * REFERRAL_BONUS_AMOUNT)}` : "—"}
        </span>
        <button
          style={btnStyle}
          onClick={() => setCount(referralCount + 1)}
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
