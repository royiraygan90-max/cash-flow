"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { splitShiftHours, calcShiftPay, formatHoursAsClock } from "@/lib/shiftCalc";
import { useToast } from "./Toast";
import Icon from "./Icon";

interface EditShift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface Props {
  onClose: () => void;
  editShift?: EditShift;
}

const PRESETS = [
  { label: "בוקר 7",  start: "07:00", end: "15:00" },
  { label: "צהריים",  start: "15:00", end: "23:00" },
  { label: "לילה",    start: "23:00", end: "07:00" },
  { label: "בוקר 12", start: "07:00", end: "19:00" },
  { label: "לילה 12", start: "19:00", end: "07:00" },
];

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toDateInputValue(isoStr: string): string {
  return isoStr.split("T")[0];
}

export default function AddShiftModal({ onClose, editShift }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const isEditing = !!editShift;
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [date, setDate]           = useState(() => editShift ? toDateInputValue(editShift.date) : todayLocal());
  const [startTime, setStartTime] = useState(editShift?.startTime ?? "");
  const [endTime, setEndTime]     = useState(editShift?.endTime ?? "");

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

  // Live preview — computed inline
  const hasPreview  = startTime !== "" && endTime !== "";
  const previewDate = hasPreview && date ? new Date(date + "T00:00:00") : null;
  const previewSplit = previewDate ? splitShiftHours(previewDate, startTime, endTime) : null;
  const previewPay   = previewSplit ? Math.round(calcShiftPay(previewSplit.regularHours, previewSplit.shabbatHours)) : 0;
  const isMixed       = !!previewSplit && previewSplit.regularHours > 0 && previewSplit.shabbatHours > 0;
  const isPureShabbat = !!previewSplit && previewSplit.regularHours === 0 && previewSplit.shabbatHours > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !startTime || !endTime) return;

    setIsSaving(true);
    try {
      let res: Response;
      if (isEditing) {
        res = await fetch(`/api/shifts/${editShift!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, startTime, endTime }),
        });
      } else {
        res = await fetch("/api/shifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, startTime, endTime }),
        });
      }
      if (!res.ok) throw new Error("save failed");
      showToast({
        type: "success",
        message: isEditing ? "המשמרת עודכנה" : "המשמרת נשמרה",
        detail: `${startTime} → ${endTime}`,
      });
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

  const modalStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        background: "#0d1014",
        borderRadius: "28px 28px 0 0",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
        padding: "24px 20px calc(24px + env(safe-area-inset-bottom))",
        maxHeight: "92vh",
        overflowY: "auto",
      }
    : {
        background: "#0d1014",
        border: "1px solid #20272f",
        borderRadius: 28,
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        padding: "32px",
        width: "100%",
        maxWidth: 460,
      };

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
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34,
              borderRadius: "50%",
              background: "#161b22",
              border: "none",
              color: "#9aa6b4",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon name="close" size={18} />
          </button>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
            {isEditing ? "עריכת משמרת" : "משמרת חדשה"}
          </h2>
          <div style={{ width: 34 }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Preset chips */}
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
              scrollbarWidth: "none",
            }}
          >
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => { setStartTime(p.start); setEndTime(p.end); }}
                style={{
                  background: "#11151b",
                  border: "1px solid #1b212a",
                  borderRadius: 14,
                  padding: "10px 14px",
                  fontSize: 13,
                  fontFamily: "Rubik, sans-serif",
                  color: "#cdd5de",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(52,224,161,.4)";
                  e.currentTarget.style.color = "#34e0a1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#1b212a";
                  e.currentTarget.style.color = "#cdd5de";
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Date */}
          <div style={pillRow}>
            <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>תאריך</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f2f5f8",
                fontSize: 14,
                fontFamily: "Rubik, sans-serif",
                colorScheme: "dark",
              }}
            />
          </div>

          {/* Start + End time row */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ ...pillRow, flex: 1 }}>
              <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif", flexShrink: 0 }}>התחלה</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#f2f5f8",
                  fontSize: 14,
                  fontFamily: "Rubik, sans-serif",
                  colorScheme: "dark",
                  direction: "ltr",
                  flex: 1,
                  textAlign: "left",
                }}
              />
            </div>
            <div style={{ ...pillRow, flex: 1 }}>
              <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif", flexShrink: 0 }}>סיום</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#f2f5f8",
                  fontSize: 14,
                  fontFamily: "Rubik, sans-serif",
                  colorScheme: "dark",
                  direction: "ltr",
                  flex: 1,
                  textAlign: "left",
                }}
              />
            </div>
          </div>

          {/* Live preview */}
          {hasPreview && previewSplit && (
            <div
              style={{
                textAlign: "center",
                padding: "10px 0 4px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: "#9aa6b4", fontFamily: "Rubik, sans-serif" }}>
                  {formatHoursAsClock(previewSplit.totalHours)} שעות · כ-₪{previewPay.toLocaleString("he-IL")}
                </span>
                {isPureShabbat && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "#a78bfa",
                      background: "rgba(167,139,250,.13)",
                      borderRadius: 8,
                      padding: "2px 8px",
                      fontFamily: "Rubik, sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    שבת
                  </span>
                )}
              </div>
              {isMixed && (
                <span style={{ fontSize: 12, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>
                  שבת {formatHoursAsClock(previewSplit.shabbatHours)} · רגיל {formatHoursAsClock(previewSplit.regularHours)}
                </span>
              )}
            </div>
          )}

          {/* Save button */}
          <button
            type="submit"
            disabled={isSaving || isPending}
            style={{
              width: "100%",
              padding: 16,
              background: "#34e0a1",
              color: "#06231a",
              border: "none",
              borderRadius: 16,
              cursor: (isSaving || isPending) ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 16,
              fontFamily: "Rubik, sans-serif",
              opacity: (isSaving || isPending) ? 0.7 : 1,
              marginTop: 4,
              transition: "opacity 0.15s",
            }}
          >
            {(isSaving || isPending) ? "שומר..." : isEditing ? "שמירת שינויים" : "שמירת משמרת"}
          </button>
        </form>
      </div>
    </div>
  );
}
