"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { isOvernightShift, formatHoursAsClock } from "@/lib/shiftCalc";
import { HEBREW_DAYS } from "@/lib/hebrewDates";
import AddShiftModal from "./AddShiftModal";
import Icon from "./Icon";

interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isShabbat: boolean;
  hours: number;
  regularHours: number | null;
  shabbatHours: number | null;
  createdAt: string;
}

interface Props {
  shifts: Shift[];
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr.split("T")[0] + "T00:00:00");
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr.split("T")[0] + "T00:00:00");
  return HEBREW_DAYS[d.getDay()];
}

function ShiftRow({ shift }: { shift: Shift }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const overnight = isOvernightShift(shift.startTime, shift.endTime);
  const reg  = shift.regularHours ?? 0;
  const shab = shift.shabbatHours ?? 0;
  const pureShabbat = reg === 0 && shab > 0;
  const mixed       = reg > 0  && shab > 0;

  async function handleDelete() {
    await fetch(`/api/shifts/${shift.id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  return (
    <>
      {editing && <AddShiftModal editShift={shift} onClose={() => setEditing(false)} />}
      <div
        className="group"
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #161b22",
          padding: "12px 16px",
          gap: 10,
          direction: "rtl",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#1b2230")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {/* Day + date (stacked) */}
        <div style={{ flexShrink: 0, minWidth: 44 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
            {getDayName(shift.date)}
          </p>
          <p style={{ fontSize: 11, color: "#6b7785", fontFamily: "Rubik, sans-serif", marginTop: 2 }}>
            {fmtDate(shift.date)}
          </p>
        </div>

        {/* Start → End + overnight indicator */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
          <span
            dir="ltr"
            style={{ fontSize: 13, color: "#cdd5de", fontFamily: "Rubik, sans-serif", whiteSpace: "nowrap" }}
          >
            {shift.startTime} → {shift.endTime}
          </span>
          {overnight && (
            <span style={{ color: "#6b7785", display: "flex", flexShrink: 0 }}>
              <Icon name="dark_mode" size={14} />
            </span>
          )}
        </div>

        {/* Hours + badges */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{ fontSize: 14, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}
              dir="ltr"
            >
              {formatHoursAsClock(shift.hours)}
            </span>
            {pureShabbat && (
              <span
                style={{
                  fontSize: 10,
                  color: "#a78bfa",
                  background: "rgba(167,139,250,.13)",
                  borderRadius: 8,
                  padding: "2px 8px",
                  fontFamily: "Rubik, sans-serif",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                שבת
              </span>
            )}
          </div>
          {mixed && (
            <p
              style={{
                fontSize: 11,
                color: "#9aa6b4",
                fontFamily: "Rubik, sans-serif",
                marginTop: 2,
                whiteSpace: "nowrap",
                direction: "rtl",
              }}
            >
              שבת {formatHoursAsClock(shab)} · רגיל {formatHoursAsClock(reg)}
            </p>
          )}
        </div>

        {/* Edit / delete */}
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
          {confirm ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                onClick={handleDelete}
                disabled={isPending}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#ff6b6b", fontSize: 12, fontFamily: "Rubik, sans-serif", padding: 0 }}
              >
                {isPending ? "..." : "כן"}
              </button>
              <button
                onClick={() => setConfirm(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6776", fontSize: 12, padding: 0 }}
              >
                לא
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                aria-label="ערוך"
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6776", padding: 4, display: "flex", alignItems: "center", transition: "color 0.1s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#34e0a1")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#5c6776")}
              >
                <Icon name="edit" size={16} />
              </button>
              <button
                onClick={() => setConfirm(true)}
                aria-label="מחק"
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6776", padding: 4, display: "flex", alignItems: "center", transition: "color 0.1s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6b6b")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#5c6776")}
              >
                <Icon name="delete" size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function ShiftList({ shifts }: Props) {
  if (shifts.length === 0) {
    return (
      <div
        style={{
          background: "#11151b",
          border: "1px solid #1b212a",
          borderRadius: 20,
          padding: 48,
          textAlign: "center",
          color: "#6b7785",
          fontSize: 14,
          fontFamily: "Rubik, sans-serif",
        }}
      >
        אין משמרות לחודש זה
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#1b2230",
        border: "1px solid #20272f",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      {shifts.map((shift) => (
        <ShiftRow key={shift.id} shift={shift} />
      ))}
    </div>
  );
}
