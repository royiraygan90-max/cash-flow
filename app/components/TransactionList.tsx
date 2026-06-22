"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import AddTransactionModal from "./AddTransactionModal";
import Icon from "./Icon";

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
  limit?: number;
}

function getWeekLabel(dateStr: string): string {
  const day = new Date(dateStr).getDate();
  if (day <= 7)  return "שבוע 1";
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

function weekNet(txs: Transaction[]): number {
  return txs.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const c = CATEGORY_COLORS[tx.category] ?? DEFAULT_CATEGORY_COLOR;

  async function handleDelete() {
    await fetch(`/api/transactions/${tx.id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  return (
    <>
      {editing && <AddTransactionModal editTransaction={tx} onClose={() => setEditing(false)} />}
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
        {/* Icon chip */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: c.bg,
            color: c.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name={c.icon} size={20} />
        </div>

        {/* Description + subtext */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#f2f5f8",
              fontFamily: "Rubik, sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {tx.description || tx.category}
          </p>
          <p style={{ fontSize: 11, color: "#6b7785", fontFamily: "Rubik, sans-serif", marginTop: 2 }}>
            {fmtDate(tx.date)} · {tx.category}
          </p>
        </div>

        {/* Amount */}
        <span
          dir="ltr"
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: tx.type === "income" ? "#34e0a1" : "#dfe5ec",
            fontFamily: "Rubik, sans-serif",
            flexShrink: 0,
          }}
        >
          {tx.type === "income" ? "+" : "−"}₪{fmtAmount(tx.amount)}
        </span>

        {/* Action buttons */}
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

type TypeFilter = "all" | "income" | "expense";

const FILTER_SEGMENTS: { label: string; value: TypeFilter }[] = [
  { label: "הכל",     value: "all"     },
  { label: "הוצאות",  value: "expense" },
  { label: "הכנסות",  value: "income"  },
];

export default function TransactionList({ transactions }: Props) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  // Month is empty — preserve original empty state exactly
  if (transactions.length === 0) {
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
        אין עסקאות לחודש זה
      </div>
    );
  }

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    const q = query.trim().toLowerCase();
    if (q === "") return true;
    return (
      tx.description.toLowerCase().includes(q) ||
      tx.category.toLowerCase().includes(q)
    );
  });

  const grouped: Record<string, Transaction[]> = {};
  for (const tx of filtered) {
    const week = getWeekLabel(tx.date);
    if (!grouped[week]) grouped[week] = [];
    grouped[week].push(tx);
  }

  return (
    <div>
      {/* ── Header: title + count ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          direction: "rtl",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#f2f5f8",
            fontFamily: "Rubik, sans-serif",
          }}
        >
          עסקאות החודש
        </span>
        <span
          style={{
            fontSize: 12,
            color: "#6b7785",
            fontFamily: "Rubik, sans-serif",
          }}
        >
          ({transactions.length})
        </span>
      </div>

      {/* ── Search input ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          direction: "rtl",
          background: "#11151b",
          border: "1px solid #1b212a",
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: 10,
        }}
      >
        {/* Icon on the right in RTL (first child) */}
        <span style={{ color: "#6b7785", display: "flex", flexShrink: 0 }}>
          <Icon name="search" size={18} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש לפי תיאור או קטגוריה..."
          dir="rtl"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#f2f5f8",
            fontSize: 14,
            fontFamily: "Rubik, sans-serif",
          }}
        />
      </div>

      {/* ── Segmented type filter ── */}
      <div
        style={{
          display: "flex",
          background: "#11151b",
          border: "1px solid #1b212a",
          borderRadius: 16,
          padding: 5,
          gap: 4,
          marginBottom: 14,
        }}
      >
        {FILTER_SEGMENTS.map(({ label, value }) => {
          const active = typeFilter === value;
          return (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              style={{
                flex: 1,
                fontSize: 13,
                fontFamily: "Rubik, sans-serif",
                fontWeight: active ? 500 : 400,
                color: active ? "#f2f5f8" : "#7c8896",
                background: active ? "#1b2230" : "transparent",
                border: active ? "1px solid #20272f" : "1px solid transparent",
                borderRadius: 11,
                padding: "7px 12px",
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
                minHeight: 36,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── List card ── */}
      {filtered.length === 0 ? (
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
          לא נמצאו עסקאות התואמות לחיפוש
        </div>
      ) : (
        <div
          style={{
            background: "#1b2230",
            border: "1px solid #20272f",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {Object.entries(grouped).map(([week, txs]) => {
            const net = weekNet(txs);
            return (
              <div key={week}>
                <div
                  style={{
                    padding: "8px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#161b22",
                    direction: "rtl",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>
                    {week}
                  </span>
                  <span
                    dir="ltr"
                    style={{ fontSize: 12, fontWeight: 500, color: net >= 0 ? "#34e0a1" : "#ff8f8f", fontFamily: "Rubik, sans-serif" }}
                  >
                    {net >= 0 ? "+" : "−"}₪{Math.abs(net).toLocaleString("he-IL")}
                  </span>
                </div>
                {txs.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
