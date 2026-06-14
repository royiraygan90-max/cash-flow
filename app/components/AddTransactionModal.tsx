"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

const INCOME_CATEGORIES = ["משכורת", "פרילנס", "מסחר", "אחר"];
const EXPENSE_CATEGORIES = ["שכירות", "מזון", "תחבורה", "בילויים", "בריאות", "ביגוד", "חיסכון", "אחר"];

interface Props {
  onClose: () => void;
}

export default function AddTransactionModal({ onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const accentColor = type === "income" ? "#00875a" : "#dc2626";
  const accentBg = type === "income" ? "#f0fdf4" : "#fef2f2";

  useEffect(() => {
    setCategory(type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  }, [type]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, type, category, description, amount }),
    });

    startTransition(() => {
      router.refresh();
      onClose();
    });
  }

  const inputStyle: React.CSSProperties = {
    background: "#f9fafb",
    border: "1px solid #e8e8e8",
    color: "#111111",
    borderRadius: "6px",
    padding: "10px 14px",
    fontSize: "0.9rem",
    fontFamily: "Inter, sans-serif",
    outline: "none",
    width: "100%",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.7rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "#6b7280",
    marginBottom: "6px",
    display: "block",
    fontFamily: "Inter, sans-serif",
  };

  const modalStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: "16px 16px 0 0",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
        padding: "24px 20px",
        maxHeight: "90vh",
        overflowY: "auto",
      }
    : {
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        padding: "40px",
        width: "100%",
        maxWidth: "480px",
      };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        zIndex: 50,
        padding: isMobile ? 0 : "16px",
        direction: "rtl",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={modalStyle}>
        {/* Drag handle — mobile only */}
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <div
              style={{
                width: "40px",
                height: "4px",
                background: "#e8e8e8",
                borderRadius: "2px",
              }}
            />
          </div>
        )}

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#111111",
              fontFamily: "Inter, sans-serif",
            }}
          >
            עסקה חדשה
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              fontSize: "1.25rem",
              lineHeight: 1,
              padding: "4px",
              transition: "color 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#111111")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Type toggle */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setType("income")}
              style={{
                flex: 1,
                padding: "10px",
                background: type === "income" ? "#f0fdf4" : "#f5f5f5",
                border: type === "income" ? "1px solid #00875a" : "1px solid #e8e8e8",
                color: type === "income" ? "#00875a" : "#6b7280",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontFamily: "Inter, sans-serif",
                fontWeight: type === "income" ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              הכנסה
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              style={{
                flex: 1,
                padding: "10px",
                background: type === "expense" ? "#fef2f2" : "#f5f5f5",
                border: type === "expense" ? "1px solid #dc2626" : "1px solid #e8e8e8",
                color: type === "expense" ? "#dc2626" : "#6b7280",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontFamily: "Inter, sans-serif",
                fontWeight: type === "expense" ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              הוצאה
            </button>
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>תאריך</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e8e8e8")}
            />
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>קטגוריה</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e8e8e8")}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>תיאור (אופציונלי)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור קצר..."
              style={{ ...inputStyle, color: "#111111" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e8e8e8")}
            />
          </div>

          {/* Amount */}
          <div>
            <label style={labelStyle}>סכום (₪)</label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f9fafb",
                border: "1px solid #e8e8e8",
                borderRadius: "6px",
                transition: "border-color 0.15s",
              }}
              onFocusCapture={(e) => (e.currentTarget.style.borderColor = accentColor)}
              onBlurCapture={(e) => (e.currentTarget.style.borderColor = "#e8e8e8")}
            >
              <span
                style={{
                  padding: "10px 12px",
                  color: "#9ca3af",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.9rem",
                  borderLeft: "1px solid #e8e8e8",
                }}
              >
                ₪
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required
                placeholder="0"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#111111",
                  padding: "10px 14px",
                  fontSize: "0.9rem",
                  fontFamily: "'JetBrains Mono', monospace",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%",
              padding: "12px",
              background: accentColor,
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: isPending ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
              fontFamily: "Inter, sans-serif",
              opacity: isPending ? 0.7 : 1,
              transition: "background 0.15s, opacity 0.15s",
              marginTop: "4px",
            }}
            onMouseEnter={(e) => {
              if (!isPending)
                e.currentTarget.style.background =
                  type === "income" ? "#006644" : "#b91c1c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = accentColor;
            }}
          >
            {isPending ? "שומר..." : "הוסף"}
          </button>
        </form>
      </div>
    </div>
  );
}
