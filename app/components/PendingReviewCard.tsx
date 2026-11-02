"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import { EXPENSE_CATEGORIES } from "./AddTransactionModal";
import { useToast } from "./Toast";

export interface PendingCharge {
  id: string;
  date: string;
  amount: number;
  /** The merchant name from the SMS */
  merchant: string;
}

const font = { fontFamily: "Rubik, sans-serif" } as const;

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function PendingRow({ charge }: { charge: PendingCharge }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!category) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/transactions/${charge.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, note, remember }),
      });
      if (!res.ok) throw new Error("review failed");
      showToast({
        type: "success",
        message: "ההוצאה סווגה",
        detail: remember ? `${category} · יישמר גם לפעם הבאה` : category,
      });
      startTransition(() => router.refresh());
    } catch {
      showToast({ type: "error", message: "השמירה נכשלה", detail: "בדוק את החיבור ונסה שוב" });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("למחוק את ההוצאה הזאת?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/transactions/${charge.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      startTransition(() => router.refresh());
    } catch {
      showToast({ type: "error", message: "המחיקה נכשלה", detail: "בדוק את החיבור ונסה שוב" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ borderTop: "1px solid #2a2418", paddingTop: 12, marginTop: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", width: "100%", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <div style={{ flex: 1, textAlign: "right", overflow: "hidden" }}>
          <p style={{ ...font, fontSize: 14, fontWeight: 500, color: "#f2f5f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {charge.merchant}
          </p>
          <p style={{ ...font, fontSize: 11, color: "#8a7f68", marginTop: 2 }}>{fmtDate(charge.date)}</p>
        </div>
        <span dir="ltr" style={{ ...font, fontSize: 15, fontWeight: 600, color: "#f2f5f8" }}>
          ₪{charge.amount.toLocaleString("he-IL")}
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {EXPENSE_CATEGORIES.map((cat) => {
              const c = CATEGORY_COLORS[cat] ?? DEFAULT_CATEGORY_COLOR;
              const selected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    ...font,
                    fontSize: 12,
                    padding: "7px 12px",
                    borderRadius: 999,
                    cursor: "pointer",
                    color: selected ? "#f2f5f8" : c.color,
                    background: selected ? c.bg : "transparent",
                    border: `1px solid ${selected ? c.color : c.border}`,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="הערה (למשל: תספורת)"
            style={{
              ...font,
              width: "100%",
              marginTop: 12,
              background: "#11151b",
              border: "1px solid #1b212a",
              color: "#f2f5f8",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 16,
              outline: "none",
              direction: "rtl",
            }}
          />

          <label style={{ ...font, display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 13, color: "#c9bfa6", cursor: "pointer" }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            זכור לפעם הבאה (אותו בית עסק ואותו סכום)
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button
              type="button"
              disabled={!category || busy}
              onClick={save}
              style={{
                ...font,
                flex: 1,
                padding: "11px 0",
                borderRadius: 12,
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                cursor: category && !busy ? "pointer" : "default",
                background: category ? "#fbbf24" : "#2a2418",
                color: category ? "#1a1405" : "#6b6350",
              }}
            >
              שמור
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={remove}
              style={{ ...font, padding: "11px 16px", borderRadius: 12, border: "1px solid #3a2a2a", background: "transparent", color: "#f87171", fontSize: 14, cursor: "pointer" }}
            >
              מחק
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Card charges that came in by SMS and are waiting for a category and a note. */
export default function PendingReviewCard({ charges }: { charges: PendingCharge[] }) {
  if (charges.length === 0) return null;
  return (
    <div
      style={{
        background: "#1a1708",
        border: "1px solid #3a3115",
        borderRadius: 20,
        padding: "16px 16px 18px",
        marginBottom: 12,
      }}
    >
      <p style={{ ...font, fontSize: 14, fontWeight: 600, color: "#fbbf24" }}>
        {charges.length === 1 ? "חיוב אחד מחכה לסיווג" : `${charges.length} חיובים מחכים לסיווג`}
      </p>
      <p style={{ ...font, fontSize: 11, color: "#8a7f68", marginTop: 2 }}>
        הם כבר נספרים בסכומים כ״אחר״ עד שתבחר קטגוריה
      </p>
      {charges.map((c) => (
        <PendingRow key={c.id} charge={c} />
      ))}
    </div>
  );
}
