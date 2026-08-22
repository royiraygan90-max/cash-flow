"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import { EXPENSE_CATEGORIES } from "./AddTransactionModal";
import { useToast } from "./Toast";
import Icon from "./Icon";

// Budgets only make sense for categories that actually show up in the
// breakdown — פרילנס nets out against its own income and never appears there.
const BUDGETABLE_CATEGORIES = EXPENSE_CATEGORIES.filter((c) => c !== "פרילנס");

interface Props {
  budgets: Record<string, number>;
  onClose: () => void;
}

export default function CategoryBudgetsModal({ budgets, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(BUDGETABLE_CATEGORIES.map((cat) => [cat, budgets[cat] ? String(budgets[cat]) : ""]))
  );

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
      const res = await fetch("/api/category-budgets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgets: values }),
      });
      if (!res.ok) throw new Error("save failed");
      showToast({ type: "success", message: "התקציבים נשמרו" });
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
    padding: "12px 16px",
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
    width: 90,
    direction: "ltr",
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
            תקציב לקטגוריות
          </h2>
          <div style={{ width: 34 }} />
        </div>

        <p style={{ fontSize: 12, color: "#7c8896", fontFamily: "Rubik, sans-serif", marginBottom: 16, textAlign: "center" }}>
          הגדר תקציב חודשי לקטגוריה — נסמן כשמתקרבים או חורגים ממנו. השאר ריק כדי לבטל.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {BUDGETABLE_CATEGORIES.map((cat) => {
            const c = CATEGORY_COLORS[cat] ?? DEFAULT_CATEGORY_COLOR;
            return (
              <div key={cat} style={pillRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: c.bg, color: c.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={c.icon} size={16} />
                  </div>
                  <span style={{ fontSize: 13, color: "#cdd5de", fontFamily: "Rubik, sans-serif" }}>{cat}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="ללא תקציב"
                    value={values[cat]}
                    onChange={(e) => setValues((v) => ({ ...v, [cat]: e.target.value }))}
                    style={numberInput}
                  />
                  <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>₪</span>
                </div>
              </div>
            );
          })}

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
            {(isSaving || isPending) ? "שומר..." : "שמירת תקציבים"}
          </button>
        </form>
      </div>
    </div>
  );
}
