"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import { useToast } from "./Toast";
import Icon from "./Icon";

export interface AutoAddedCharge {
  id: string;
  date: string;
  amount: number;
  /** The rule's note, or the merchant name when the rule has none */
  description: string;
  category: string;
}

const font = { fontFamily: "Rubik, sans-serif" } as const;

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function headline(n: number): string {
  if (n === 1) return "נוסף חיוב אחד לחשבון";
  return `נוספו ${n} חיובים לחשבון`;
}

/** Card charges that a saved rule filed on its own since the last visit, so it is certain they landed. */
export default function AutoAddedCard({ charges }: { charges: AutoAddedCharge[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  if (charges.length === 0) return null;

  const total = charges.reduce((sum, c) => sum + c.amount, 0);

  async function acknowledge() {
    setBusy(true);
    try {
      const res = await fetch("/api/transactions/seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: charges.map((c) => c.id) }),
      });
      if (!res.ok) throw new Error("seen failed");
      startTransition(() => router.refresh());
    } catch {
      showToast({ type: "error", message: "הפעולה נכשלה", detail: "בדוק את החיבור ונסה שוב" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        background: "#0f1a16",
        border: "1px solid #1c3329",
        borderRadius: 20,
        padding: "16px 16px 14px",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "#34e0a1", display: "inline-flex" }}>
          <Icon name="check_circle" size={20} />
        </span>
        <p style={{ ...font, flex: 1, fontSize: 14, fontWeight: 600, color: "#34e0a1" }}>{headline(charges.length)}</p>
        {charges.length > 1 && (
          <span dir="ltr" style={{ ...font, fontSize: 13, fontWeight: 600, color: "#9fd9c0" }}>
            ₪{total.toLocaleString("he-IL")}
          </span>
        )}
      </div>

      {charges.map((c) => {
        const color = CATEGORY_COLORS[c.category] ?? DEFAULT_CATEGORY_COLOR;
        return (
          <div
            key={c.id}
            style={{ display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid #1c3329", paddingTop: 10, marginTop: 10 }}
          >
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p style={{ ...font, fontSize: 14, fontWeight: 500, color: "#f2f5f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.description}
              </p>
              <p style={{ ...font, fontSize: 11, color: "#5f8a76", marginTop: 2 }}>
                {fmtDate(c.date)} ·{" "}
                <span style={{ color: color.color }}>{c.category}</span>
              </p>
            </div>
            <span dir="ltr" style={{ ...font, fontSize: 15, fontWeight: 600, color: "#f2f5f8" }}>
              ₪{c.amount.toLocaleString("he-IL")}
            </span>
          </div>
        );
      })}

      <button
        type="button"
        disabled={busy}
        onClick={acknowledge}
        style={{
          ...font,
          width: "100%",
          marginTop: 14,
          padding: "10px 0",
          borderRadius: 12,
          border: "1px solid #1c3329",
          background: "transparent",
          color: "#34e0a1",
          fontSize: 14,
          fontWeight: 500,
          cursor: busy ? "default" : "pointer",
        }}
      >
        הבנתי
      </button>
    </div>
  );
}
