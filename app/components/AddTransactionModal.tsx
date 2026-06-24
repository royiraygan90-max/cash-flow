"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import Icon from "./Icon";
import { useToast } from "./Toast";

const INCOME_CATEGORIES  = ["משכורת", "פרילנס", "מסחר", "אחר"];
const EXPENSE_CATEGORIES = ["שכירות", "מזון", "תחבורה", "בילויים", "בריאות", "משק בית", "מסחר", "פרילנס", "אחר"];

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

function toDateInputValue(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AddTransactionModal({ onClose, editTransaction }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const isEditing = !!editTransaction;
  const [isSaving, setIsSaving] = useState(false);

  const [type, setType]           = useState<"income" | "expense">(editTransaction ? (editTransaction.type === "income" ? "income" : "expense") : "expense");
  const [date, setDate]           = useState(() => editTransaction ? toDateInputValue(editTransaction.date) : new Date().toISOString().split("T")[0]);
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

          {/* Amount input */}
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ fontSize: 24, color: type === "expense" ? "#ff6b6b" : "#34e0a1", fontFamily: "Rubik, sans-serif", fontWeight: 600 }}>
                {type === "expense" ? "−" : "+"}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 52,
                  fontWeight: 600,
                  color: "#f2f5f8",
                  fontFamily: "Rubik, sans-serif",
                  width: "160px",
                  textAlign: "center",
                  direction: "ltr",
                }}
              />
              <span style={{ fontSize: 26, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>₪</span>
            </div>
          </div>

          {/* Category grid */}
          <div>
            <p style={{ fontSize: 12, color: "#7c8896", marginBottom: 10, fontFamily: "Rubik, sans-serif" }}>קטגוריה</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
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
                        padding: "12px 8px",
                        borderRadius: 16,
                        border: selected ? `1px solid ${c.color}` : "1px solid #1b212a",
                        background: selected ? c.bg : "#11151b",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
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

          {/* Description */}
          <div style={pillRow}>
            <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>תיאור</span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="תיאור קצר (אופציונלי)"
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f2f5f8",
                fontSize: 16,
                fontFamily: "Rubik, sans-serif",
                textAlign: "right",
                flex: 1,
                direction: "rtl",
              }}
            />
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
                fontSize: 16,
                fontFamily: "Rubik, sans-serif",
                colorScheme: "dark",
              }}
            />
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
            {(isSaving || isPending) ? "שומר..." : isEditing ? "שמירת שינויים" : "שמירת עסקה"}
          </button>
        </form>
      </div>
    </div>
  );
}
