"use client";

import { useEffect, useMemo, useState } from "react";
import { calcHoursForTargetNet } from "@/lib/salaryCalc";
import { formatHoursAsClock } from "@/lib/shiftCalc";
import Icon from "./Icon";

export interface SalaryTargetDefaults {
  regularRate: number;
  shabbatRate: number;
  monthlyBonus: number;
  travelAllowance: number;
  currentRegularHours?: number;
  currentShabbatHours?: number;
}

interface Props {
  defaults: SalaryTargetDefaults;
  onClose: () => void;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("he-IL");
}

export default function SalaryTargetModal({ defaults, onClose }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  const currentTotal = (defaults.currentRegularHours ?? 0) + (defaults.currentShabbatHours ?? 0);
  const initialSharePct = currentTotal > 0
    ? Math.round(((defaults.currentShabbatHours ?? 0) / currentTotal) * 100)
    : 20;

  const [targetNet, setTargetNet] = useState("12000");
  const [regularRate, setRegularRate] = useState(String(defaults.regularRate));
  const [shabbatRate, setShabbatRate] = useState(String(defaults.shabbatRate));
  const [shabbatSharePct, setShabbatSharePct] = useState(initialSharePct);
  const [includeBonus, setIncludeBonus] = useState(defaults.monthlyBonus > 0);
  const [includeTravel, setIncludeTravel] = useState(defaults.travelAllowance > 0);

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

  const result = useMemo(() => {
    return calcHoursForTargetNet({
      targetNet: Number(targetNet) || 0,
      shabbatShare: shabbatSharePct / 100,
      regularRate: Number(regularRate) || 0,
      shabbatRate: Number(shabbatRate) || 0,
      monthlyBonus: includeBonus ? defaults.monthlyBonus : 0,
      travelAllowance: includeTravel ? defaults.travelAllowance : 0,
    });
  }, [targetNet, shabbatSharePct, regularRate, shabbatRate, includeBonus, includeTravel, defaults.monthlyBonus, defaults.travelAllowance]);

  const weeklyAvgHours = result.totalHours / 4.33;

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
    : { background: "#0d1014", border: "1px solid #20272f", borderRadius: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", padding: "32px", width: "100%", maxWidth: 460, maxHeight: "88vh", overflowY: "auto" };

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
            מחשבון יעד משכורת
          </h2>
          <div style={{ width: 34 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={pillRow}>
            <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>יעד משכורת נטו ₪</span>
            <input type="text" inputMode="decimal" value={targetNet} onChange={(e) => setTargetNet(e.target.value)} style={numberInput} autoFocus />
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ ...pillRow, flex: 1 }}>
              <span style={{ fontSize: 12, color: "#7c8896", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>תעריף רגיל ₪</span>
              <input type="text" inputMode="decimal" value={regularRate} onChange={(e) => setRegularRate(e.target.value)} style={numberInput} />
            </div>
            <div style={{ ...pillRow, flex: 1 }}>
              <span style={{ fontSize: 12, color: "#7c8896", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>תעריף שבת ₪</span>
              <input type="text" inputMode="decimal" value={shabbatRate} onChange={(e) => setShabbatRate(e.target.value)} style={numberInput} />
            </div>
          </div>

          <div style={{ ...pillRow, flexDirection: "column", alignItems: "stretch", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>אחוז שעות שבת מהסך הכל</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#a78bfa", fontFamily: "Rubik, sans-serif", direction: "ltr" }}>{shabbatSharePct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={shabbatSharePct}
              onChange={(e) => setShabbatSharePct(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#a78bfa", cursor: "pointer" }}
            />
          </div>

          <label style={{ ...pillRow, cursor: "pointer" }}>
            <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>
              לכלול בונוס חודשי (₪{fmt(defaults.monthlyBonus)})
            </span>
            <input
              type="checkbox"
              checked={includeBonus}
              onChange={(e) => setIncludeBonus(e.target.checked)}
              style={{ width: 20, height: 20, accentColor: "#34e0a1", flexShrink: 0 }}
            />
          </label>

          <label style={{ ...pillRow, cursor: "pointer" }}>
            <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>
              לכלול נסיעות (₪{fmt(defaults.travelAllowance)})
            </span>
            <input
              type="checkbox"
              checked={includeTravel}
              onChange={(e) => setIncludeTravel(e.target.checked)}
              style={{ width: 20, height: 20, accentColor: "#34e0a1", flexShrink: 0 }}
            />
          </label>

          <div style={{ borderTop: "1px solid #20272f", margin: "8px 0 4px" }} />

          {/* Results */}
          <div
            style={{
              background: "#1b2230",
              border: "1px solid #20272f",
              borderRadius: 20,
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 13, color: "#9aa6b4", fontFamily: "Rubik, sans-serif" }}>
              סה״כ שעות נדרשות
            </span>
            <span style={{ fontSize: 20, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif", direction: "ltr" }}>
              {formatHoursAsClock(result.totalHours)}
            </span>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, background: "#101a16", border: "1px solid #1c3329", borderRadius: 20, padding: "14px 16px" }}>
              <p style={{ fontSize: 11, color: "#5f8a76", marginBottom: 6, fontFamily: "Rubik, sans-serif" }}>שעות רגילות</p>
              <p style={{ fontSize: 23, fontWeight: 600, color: "#34e0a1", fontFamily: "Rubik, sans-serif", direction: "ltr" }}>
                {formatHoursAsClock(result.regularHours)}
              </p>
            </div>
            <div style={{ flex: 1, background: "#1e1830", border: "1px solid #2e2350", borderRadius: 20, padding: "14px 16px" }}>
              <p style={{ fontSize: 11, color: "#8a7fb8", marginBottom: 6, fontFamily: "Rubik, sans-serif" }}>שעות שבת</p>
              <p style={{ fontSize: 23, fontWeight: 600, color: "#a78bfa", fontFamily: "Rubik, sans-serif", direction: "ltr" }}>
                {formatHoursAsClock(result.shabbatHours)}
              </p>
            </div>
          </div>

          <div style={{ ...pillRow }}>
            <span style={{ fontSize: 13, color: "#9aa6b4", fontFamily: "Rubik, sans-serif" }}>ברוטו נדרש</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif", direction: "ltr" }}>
              ₪{fmt(result.gross)}
            </span>
          </div>

          <p style={{ fontSize: 11, color: "#5c6776", fontFamily: "Rubik, sans-serif", textAlign: "center", margin: "2px 0 0" }}>
            בממוצע כ-{formatHoursAsClock(weeklyAvgHours)} שעות בשבוע (לא כולל שעות נוספות)
          </p>
        </div>
      </div>
    </div>
  );
}
