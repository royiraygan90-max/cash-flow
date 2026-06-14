"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_COLORS } from "@/lib/categoryColors";

interface Transaction {
  id: string;
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
}

interface Props {
  transactions: Transaction[];
}

function getWeekLabel(dateStr: string): string {
  const day = new Date(dateStr).getDate();
  if (day <= 7) return "שבוע 1";
  if (day <= 14) return "שבוע 2";
  if (day <= 21) return "שבוע 3";
  return "שבוע 4";
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fmtAmount(n: number): string {
  return n.toLocaleString("he-IL");
}

function CategoryTag({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? "#6b7280";
  return (
    <span
      className="text-[0.65rem] md:text-[0.7rem]"
      style={{
        background: `${color}26`,
        color: color,
        border: `1px solid ${color}4d`,
        padding: "2px 6px",
        borderRadius: "4px",
        fontWeight: 500,
        fontFamily: "Inter, sans-serif",
        flexShrink: 0,
      }}
    >
      {category}
    </span>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    await fetch(`/api/transactions/${tx.id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  return (
    <div
      className="group"
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #f5f5f5",
        transition: "background 0.1s",
        direction: "rtl",
        gap: "12px",
      }}
    >
      <div className="flex items-center gap-3 w-full px-4 py-3 md:px-6 md:py-[14px]"
        onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {/* Amount */}
        <span
          className="text-[0.9rem] md:text-[0.95rem]"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            color: tx.type === "income" ? "#00875a" : "#dc2626",
            flexShrink: 0,
            minWidth: "100px",
            textAlign: "right",
          }}
        >
          {tx.type === "income" ? "+" : "−"}₪{fmtAmount(tx.amount)}
        </span>

        {/* Description */}
        <span
          className="text-[0.85rem] md:text-[0.9rem]"
          style={{
            color: "#111111",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {tx.description || tx.category}
        </span>

        {/* Category tag */}
        <CategoryTag category={tx.category} />

        {/* Date */}
        <span
          className="text-[0.7rem]"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: "#9ca3af",
            flexShrink: 0,
            minWidth: "36px",
            textAlign: "left",
          }}
        >
          {fmtDate(tx.date)}
        </span>

        {/* Delete control */}
        <div
          style={{
            width: "24px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {confirm ? (
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                onClick={handleDelete}
                disabled={isPending}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#dc2626",
                  fontSize: "0.7rem",
                  fontFamily: "Inter, sans-serif",
                  padding: 0,
                }}
              >
                {isPending ? "..." : "כן"}
              </button>
              <button
                onClick={() => setConfirm(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: "0.7rem",
                  padding: 0,
                }}
              >
                לא
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirm(true)}
              aria-label="מחק"
              /* Always visible on touch devices; hidden until hover on desktop */
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#d1d5db",
                fontSize: "1rem",
                lineHeight: 1,
                padding: 0,
                transition: "color 0.1s, opacity 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TransactionList({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e8e8e8",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          padding: "48px",
          textAlign: "center",
          color: "#9ca3af",
          fontSize: "0.875rem",
          fontFamily: "Inter, sans-serif",
        }}
      >
        אין עסקאות לחודש זה
      </div>
    );
  }

  const grouped: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const week = getWeekLabel(tx.date);
    if (!grouped[week]) grouped[week] = [];
    grouped[week].push(tx);
  }

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#111111",
          }}
        >
          עסקאות
        </p>
      </div>

      {Object.entries(grouped).map(([week, txs]) => (
        <div key={week}>
          {/* Week separator */}
          <div
            style={{
              padding: "8px 24px",
              background: "#f9f9f9",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#9ca3af",
              }}
            >
              {week}
            </span>
          </div>
          {txs.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      ))}
    </div>
  );
}
