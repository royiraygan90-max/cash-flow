"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SalaryProfile } from "@/lib/salaryCalc";
import { useToast } from "./Toast";
import Icon from "./Icon";

interface Props {
  profile: SalaryProfile;
  onClose: () => void;
}

export default function SalarySettingsModal({ profile, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [regularRate, setRegularRate] = useState(String(profile.regularRate));
  const [shabbatRate, setShabbatRate] = useState(String(profile.shabbatRate));
  const [overtimeEnabled, setOvertimeEnabled] = useState(profile.overtimeEnabled);
  const [monthlyBonus, setMonthlyBonus] = useState(String(profile.monthlyBonus));
  const [travelAllowance, setTravelAllowance] = useState(String(profile.travelAllowance));
  const [otherDeductions, setOtherDeductions] = useState(String(profile.otherDeductions));

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/salary-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regularRate, shabbatRate, overtimeEnabled, monthlyBonus, travelAllowance, otherDeductions }),
      });
      if (!res.ok) throw new Error("save failed");
      showToast({ type: "success", message: "הגדרות השכר נשמרו" });
      startTransition(() => { router.refresh(); onClose(); });
    } catch {
      showToast({ type: "error", message: "השמירה נכשלה", detail: "בדוק את החיבור ונסה שוב" });
    } finally {
      setIsSaving(false);
    }
  }

  const pillRow: React.CSSProperties = {
    background: "#11151b",
    border: "1px solid #1b212a",
    borderRadius: 14,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  };

  const numberInput: React.CSSProperties = {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#f2f5f8",
    fontSize: 16,
    fontFamily: "Rubik, sans-serif",
    textAlign: "left",
    flex: 1,
    direction: "ltr",
    minWidth: 0,
  };

  const modalStyle: React.CSSProperties = isMobile
    ? { position: "fixed", bottom: 0, left: 0, right: 0, background: "#0d1014", borderRadius: "28px 28px 0 0", boxShadow: "0 -8px 40px rgba(0,0,0,0.6)", padding: "24px 20px calc(24px + env(safe-area-inset-bottom))", maxHeight: "92vh", overflowY: "auto" }
    : { background: "#0d1014", border: "1px solid #20272f", borderRadius: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", padding: "32px", width: "100%", maxWidth: 460 };

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        zIndex: 50,
        padding: isMobile ? 0 : 16,
        direction: "rtl",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={modalStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <button
            onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: "50%", background: "#161b22", border: "none", color: "#9aa6b4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Icon name="close" size={18} />
          </button>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
            הגדרות שכר
          </h2>
          <div style={{ width: 34 }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={pillRow}>
            <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>תעריף שעתי רגיל ₪</span>
            <input type="text" inputMode="decimal" value={regularRate} onChange={(e) => setRegularRate(e.target.value)} required style={numberInput} />
          </div>

          <div style={pillRow}>
            <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>תעריף שעתי בשבת ₪</span>
            <input type="text" inputMode="decimal" value={shabbatRate} onChange={(e) => setShabbatRate(e.target.value)} required style={numberInput} />
          </div>

          <div style={pillRow}>
            <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>בונוס חודשי קבוע ₪</span>
            <input type="text" inputMode="decimal" value={monthlyBonus} onChange={(e) => setMonthlyBonus(e.target.value)} required style={numberInput} />
          </div>

          <div style={pillRow}>
            <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>נסיעות ₪</span>
            <input type="text" inputMode="decimal" value={travelAllowance} onChange={(e) => setTravelAllowance(e.target.value)} required style={numberInput} />
          </div>

          <div style={pillRow}>
            <div>
              <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap", display: "block" }}>ניכויים קבועים נוספים ₪</span>
              <span style={{ fontSize: 11, color: "#5c6776", fontFamily: "Rubik, sans-serif", display: "block", marginTop: 4, lineHeight: 1.5 }}>
                למשל דמי טיפול/ועד — סכום קבוע שיורד כל חודש בלי קשר לשעות
              </span>
            </div>
            <input type="text" inputMode="decimal" value={otherDeductions} onChange={(e) => setOtherDeductions(e.target.value)} required style={{ ...numberInput, flexShrink: 0, width: 70 }} />
          </div>

          <label style={{ ...pillRow, cursor: "pointer", alignItems: "flex-start" }}>
            <div>
              <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap", display: "block" }}>שעות נוספות</span>
              <span style={{ fontSize: 11, color: "#5c6776", fontFamily: "Rubik, sans-serif", display: "block", marginTop: 4, lineHeight: 1.5 }}>
                מעל 8 שעות במשמרת: 125% לשעה ה-9 וה-10, 150% מעבר לזה
              </span>
            </div>
            <input
              type="checkbox"
              checked={overtimeEnabled}
              onChange={(e) => setOvertimeEnabled(e.target.checked)}
              style={{ width: 20, height: 20, accentColor: "#34e0a1", flexShrink: 0, marginTop: 2 }}
            />
          </label>

          <button
            type="submit"
            disabled={isSaving || isPending}
            style={{
              width: "100%", padding: 16,
              background: "#34e0a1", color: "#06231a",
              border: "none", borderRadius: 16,
              cursor: (isSaving || isPending) ? "not-allowed" : "pointer",
              fontWeight: 600, fontSize: 16, fontFamily: "Rubik, sans-serif",
              opacity: (isSaving || isPending) ? 0.7 : 1, marginTop: 4,
              transition: "opacity 0.15s",
            }}
          >
            {(isSaving || isPending) ? "שומר..." : "שמירת הגדרות"}
          </button>
        </form>
      </div>
    </div>
  );
}
