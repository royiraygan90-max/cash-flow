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

export default function TransactionList({ transactions, limit }: Props) {
  const displayed = limit ? transactions.slice(0, limit) : transactions;

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

  const grouped: Record<string, Transaction[]> = {};
  for (const tx of displayed) {
    const week = getWeekLabel(tx.date);
    if (!grouped[week]) grouped[week] = [];
    grouped[week].push(tx);
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
  );
}
