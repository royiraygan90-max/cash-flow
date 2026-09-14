"use client";

import { useEffect, useState } from "react";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
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
  category: string;
  transactions: Transaction[];
  onClose: () => void;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fmtAmount(n: number): string {
  return Math.round(n).toLocaleString("he-IL");
}

export default function CategoryTransactionsModal({ category, transactions, onClose }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const c = CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const total = transactions.reduce((s, t) => s + t.amount, 0);

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

  const modalStyle: React.CSSProperties = isMobile
    ? { position: "fixed", bottom: 0, left: 0, right: 0, background: "#0d1014", borderRadius: "28px 28px 0 0", boxShadow: "0 -8px 40px rgba(0,0,0,0.6)", padding: "24px 20px calc(24px + env(safe-area-inset-bottom))", maxHeight: "88vh", overflowY: "auto" }
    : { background: "#0d1014", border: "1px solid #20272f", borderRadius: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", padding: "32px", width: "100%", maxWidth: 460, maxHeight: "84vh", overflowY: "auto" };

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button
            onClick={onClose}
            aria-label="סגור"
            style={{ width: 34, height: 34, borderRadius: "50%", background: "#161b22", border: "none", color: "#9aa6b4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Icon name="close" size={18} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
              {category}
            </h2>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: c.bg, color: c.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={c.icon} size={16} />
            </div>
          </div>
          <div style={{ width: 34 }} />
        </div>

        <p style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif", marginBottom: 16, textAlign: "center" }}>
          {sorted.length} הוצאות · סה&quot;כ ₪{fmtAmount(total)}
        </p>

        {sorted.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#6b7785", fontSize: 14, fontFamily: "Rubik, sans-serif" }}>
            אין הוצאות בקטגוריה זו החודש
          </div>
        ) : (
          <div style={{ background: "#1b2230", border: "1px solid #20272f", borderRadius: 20, overflow: "hidden" }}>
            {sorted.map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: "1px solid #161b22",
                  padding: "12px 16px",
                  gap: 10,
                }}
              >
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#f2f5f8", fontFamily: "Rubik, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tx.description || tx.category}
                  </p>
                  <p style={{ fontSize: 11, color: "#6b7785", fontFamily: "Rubik, sans-serif", marginTop: 2 }}>
                    {fmtDate(tx.date)}
                  </p>
                </div>
                <span dir="ltr" style={{ fontSize: 15, fontWeight: 600, color: "#dfe5ec", fontFamily: "Rubik, sans-serif", flexShrink: 0 }}>
                  ₪{fmtAmount(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
