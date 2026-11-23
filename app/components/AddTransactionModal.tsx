"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import Icon from "./Icon";
import ModalPortal from "./ModalPortal";
import { useToast } from "./Toast";

const INCOME_CATEGORIES  = ["משכורת", "פרילנס", "מסחר", "אחר"];
// No rent here: it comes from the shared home app (home-hub) and arrives with its own category
export const EXPENSE_CATEGORIES = ["מזון", "קניות", "תחבורה", "בילויים", "בריאות", "משק בית", "מסחר", "פרילנס", "אחר"];

interface EditTransaction {
  id: string;
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
}

interface Props {
  onClose: () => void;
  editTransaction?: EditTransaction;
}

function localDateValue(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toDateInputValue(dateStr: string): string {
  return localDateValue(new Date(dateStr));
}

/** The local calendar day `daysAgo` days before today, as yyyy-mm-dd. */
function dayValue(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return localDateValue(d);
}

export default function AddTransactionModal({ onClose, editTransaction }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const isEditing = !!editTransaction;
  const [isSaving, setIsSaving] = useState(false);

  const [type, setType]           = useState<"income" | "expense">(editTransaction ? (editTransaction.type === "income" ? "income" : "expense") : "expense");
  const [date, setDate]           = useState(() => editTransaction ? toDateInputValue(editTransaction.date) : dayValue(0));
  const [category, setCategory]   = useState(editTransaction?.category ?? EXPENSE_CATEGORIES[0]);
  const [description, setDesc]    = useState(editTransaction?.description ?? "");
  const [amount, setAmount]       = useState(editTransaction ? String(editTransaction.amount) : "");
  const [isMobile, setIsMobile]   = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isEditing) setCategory(type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  }, [type, isEditing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSaving(true);
    try {
      let res: Response;
      if (isEditing) {
        res = await fetch(`/api/transactions/${editTransaction!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, type, category, description, amount }),
        });
      } else {
        res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, type, category, description, amount }),
        });
      }
      if (!res.ok) throw new Error("save failed");
      showToast({
        type: "success",
        message: isEditing ? "העסקה עודכנה" : "העסקה נשמרה",
        detail: `${type === "expense" ? "−" : "+"}${amount} ₪ · ${category}`,
      });
      startTransition(() => { router.refresh(); onClose(); });
    } catch {
      showToast({ type: "error", message: "השמירה נכשלה", detail: "בדוק את החיבור ונסה שוב" });
    } finally {
      setIsSaving(false);
    }
  }

  const isExpense = type === "expense";
  const accent = isExpense ? "#ff6b6b" : "#34e0a1";
  const font = { fontFamily: "Rubik, sans-serif" } as const;

  const detailRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
  };
  const detailIcon: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "#161b22",
    color: "#7c8896",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };
  const dateChip = (active: boolean): React.CSSProperties => ({
    ...font,
    padding: "7px 14px",
    borderRadius: 999,
    fontSize: 13,
    cursor: "pointer",
    border: `1px solid ${active ? "#34e0a155" : "#1b212a"}`,
    background: active ? "rgba(52,224,161,.12)" : "transparent",
    color: active ? "#34e0a1" : "#9aa6b4",
  });

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
    <ModalPortal>
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
          {isMobile && <div style={{ width: 40, height: 4, borderRadius: 999, background: "#262d37", margin: "-10px auto 14px" }} />}
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <button
              type="button"
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
              {isEditing ? "עריכת עסקה" : "עסקה חדשה"}
            </h2>
            {/* Spacer for symmetry */}
            <div style={{ width: 34 }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Segmented toggle */}
            <div
              style={{
                display: "flex",
                background: "#11151b",
                border: "1px solid #1b212a",
                borderRadius: 16,
                padding: 5,
                gap: 4,
              }}
            >
              {(["הוצאה", "הכנסה"] as const).map((label) => {
                const val = label === "הכנסה" ? "income" : "expense";
                const active = type === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setType(val)}
                    style={{
                      flex: 1,
                      padding: "9px",
                      borderRadius: 12,
                      border: active
                        ? `1px solid ${val === "expense" ? "#4a2228" : "rgba(52,224,161,.3)"}`
                        : "1px solid transparent",
                      background: active
                        ? val === "expense" ? "#2a1418" : "rgba(52,224,161,.12)"
                        : "transparent",
                      color: active
                        ? val === "expense" ? "#ff8f8f" : "#34e0a1"
                        : "#7c8896",
                      fontSize: 14,
                      fontFamily: "Rubik, sans-serif",
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Amount: the hero of the sheet */}
            <div
              style={{
                borderRadius: 24,
                padding: "26px 12px 22px",
                textAlign: "center",
                background: isExpense
                  ? "linear-gradient(180deg, #2a1418 0%, #12161c 100%)"
                  : "linear-gradient(180deg, #0f2a22 0%, #12161c 100%)",
                border: `1px solid ${isExpense ? "#3a1d22" : "#1c3a2f"}`,
              }}
            >
              <p style={{ ...font, fontSize: 12, color: "#7c8896", marginBottom: 6 }}>{isExpense ? "כמה הוצאת?" : "כמה נכנס?"}</p>
              <div dir="ltr" style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 8 }}>
                <span style={{ ...font, fontSize: 40, fontWeight: 600, color: accent, lineHeight: 1 }}>{isExpense ? "−" : "+"}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="0"
                  aria-label="סכום"
                  className="amount-input"
                  style={{
                    ...font,
                    // Shrinks as the number grows so it always fits on one line (the class applies it)
                    ["--amount-size" as string]: `${amount.length > 9 ? 40 : amount.length > 7 ? 50 : amount.length > 5 ? 60 : 72}px`,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontWeight: 600,
                    lineHeight: 1.05,
                    color: amount ? "#f2f5f8" : "#3a434f",
                    width: `${Math.max(amount.length, 1) + 0.5}ch`,
                    minWidth: "1.5ch",
                    maxWidth: "75%",
                    textAlign: "center",
                    padding: 0,
                  }}
                />
                <span style={{ ...font, fontSize: 34, color: "#7c8896", lineHeight: 1 }}>₪</span>
              </div>
            </div>

            {/* Category grid */}
            <div>
              <p style={{ fontSize: 12, color: "#7c8896", marginBottom: 8, fontFamily: "Rubik, sans-serif" }}>קטגוריה</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {isEditing ? (
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    style={{
                      gridColumn: "1 / -1",
                      background: "#11151b",
                      border: "1px solid #1b212a",
                      color: "#f2f5f8",
                      borderRadius: 14,
                      padding: "12px 16px",
                      fontSize: 16,
                      fontFamily: "Rubik, sans-serif",
                      outline: "none",
                    }}
                  />
                ) : (
                  categories.map((cat) => {
                    const c = CATEGORY_COLORS[cat] ?? DEFAULT_CATEGORY_COLOR;
                    const selected = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        style={{
                          padding: "10px 6px",
                          borderRadius: 16,
                          border: selected ? `1px solid ${c.color}` : "1px solid #1b212a",
                          background: selected ? c.bg : "#11151b",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 5,
                          transition: "all 0.15s",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            background: c.bg,
                            color: c.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon name={c.icon} size={18} />
                        </div>
                        <span style={{ fontSize: 12, color: selected ? "#f2f5f8" : "#9aa6b4", fontFamily: "Rubik, sans-serif" }}>
                          {cat}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Details: description and date in one card */}
            <div style={{ background: "#11151b", border: "1px solid #1b212a", borderRadius: 18 }}>
              <div style={detailRow}>
                <span style={detailIcon}><Icon name="edit_note" size={20} /></span>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="על מה זה? (אופציונלי)"
                  aria-label="תיאור"
                  style={{
                    ...font,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#f2f5f8",
                    fontSize: 16,
                    textAlign: "right",
                    flex: 1,
                    minWidth: 0,
                    direction: "rtl",
                  }}
                />
              </div>
              <div style={{ height: 1, background: "#1b212a", margin: "0 14px" }} />
              <div style={detailRow}>
                <span style={detailIcon}><Icon name="event" size={20} /></span>
                <button type="button" style={dateChip(date === dayValue(0))} onClick={() => setDate(dayValue(0))}>היום</button>
                <button type="button" style={dateChip(date === dayValue(1))} onClick={() => setDate(dayValue(1))}>אתמול</button>
                {/* The native picker sits invisibly over this chip, so a tap opens it */}
                <label style={{ ...dateChip(date !== dayValue(0) && date !== dayValue(1)), position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Icon name="calendar_month" size={16} />
                  {date !== dayValue(0) && date !== dayValue(1) ? date.split("-").reverse().join("/") : "תאריך אחר"}
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => e.target.value && setDate(e.target.value)}
                    required
                    aria-label="תאריך"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", colorScheme: "dark" }}
                  />
                </label>
              </div>
            </div>

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
                borderRadius: 18,
                cursor: (isSaving || isPending) ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 16,
                fontFamily: "Rubik, sans-serif",
                opacity: (isSaving || isPending) ? 0.7 : 1,
                marginTop: 4,
                transition: "opacity 0.15s",
              }}
            >
              {(isSaving || isPending) ? "שומר..." : isEditing ? "שמירת שינויים" : "שמירת עסקה"}
            </button>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
}
