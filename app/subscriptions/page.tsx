"use client";

import { useState, useEffect, useCallback } from "react";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  category: string;
  isActive: boolean;
}

interface FormData {
  name: string;
  amount: string;
  dayOfMonth: string;
  category: string;
}

const DEFAULT_FORM: FormData = { name: "", amount: "", dayOfMonth: "", category: "מנוי" };

function SubscriptionRow({
  sub,
  onEdit,
  onDelete,
  onToggle,
}: {
  sub: Subscription;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const c = CATEGORY_COLORS[sub.category] ?? DEFAULT_CATEGORY_COLOR;

  return (
    <div
      className="group"
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #f5f5f5",
        padding: "16px 24px",
        direction: "rtl",
        gap: "12px",
        opacity: sub.isActive ? 1 : 0.45,
        transition: "background 0.1s, opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Amount */}
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          color: "#dc2626",
          fontSize: "0.95rem",
          minWidth: "100px",
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        −₪{sub.amount.toLocaleString("he-IL")}
      </span>

      {/* Name */}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "0.9rem",
          color: "#111111",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {sub.name}
      </span>

      {/* Day badge */}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "0.7rem",
          color: "#6b7280",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        כל ה-{sub.dayOfMonth} לחודש
      </span>

      {/* Category badge */}
      <span
        style={{
          background: c.bg,
          color: c.color,
          border: `1px solid ${c.border}`,
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "0.7rem",
          fontWeight: 500,
          fontFamily: "Inter, sans-serif",
          flexShrink: 0,
        }}
      >
        {sub.category}
      </span>

      {/* Active toggle */}
      <button
        onClick={onToggle}
        title={sub.isActive ? "השבת מנוי" : "הפעל מנוי"}
        style={{
          background: sub.isActive ? "#f0fdf4" : "#f5f5f5",
          border: `1px solid ${sub.isActive ? "#00875a" : "#e8e8e8"}`,
          color: sub.isActive ? "#00875a" : "#9ca3af",
          borderRadius: "4px",
          padding: "4px 8px",
          fontSize: "0.7rem",
          fontFamily: "Inter, sans-serif",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {sub.isActive ? "פעיל" : "כבוי"}
      </button>

      {/* Edit button */}
      <button
        onClick={onEdit}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#9ca3af",
          fontSize: "0.8rem",
          fontFamily: "Inter, sans-serif",
          padding: "4px 6px",
          flexShrink: 0,
          transition: "color 0.1s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#111111")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
      >
        עריכה
      </button>

      {/* Delete with confirm */}
      {confirm ? (
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
          <button
            onClick={onDelete}
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
            כן
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
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#d1d5db",
            fontSize: "1rem",
            lineHeight: 1,
            padding: 0,
            flexShrink: 0,
            transition: "color 0.1s, opacity 0.1s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing: Subscription | null }>({
    open: false,
    editing: null,
  });
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const load = useCallback(async () => {
    const res = await fetch("/api/subscriptions");
    setSubscriptions(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closeModal = useCallback(() => {
    setModal({ open: false, editing: null });
  }, []);

  useEffect(() => {
    if (!modal.open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal.open, closeModal]);

  function openAdd() {
    setForm(DEFAULT_FORM);
    setModal({ open: true, editing: null });
  }

  function openEdit(sub: Subscription) {
    setForm({
      name: sub.name,
      amount: String(sub.amount),
      dayOfMonth: String(sub.dayOfMonth),
      category: sub.category,
    });
    setModal({ open: true, editing: sub });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.editing) {
        await fetch(`/api/subscriptions/${modal.editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            amount: parseFloat(form.amount),
            dayOfMonth: parseInt(form.dayOfMonth, 10),
            category: form.category,
          }),
        });
      } else {
        await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            amount: parseFloat(form.amount),
            dayOfMonth: parseInt(form.dayOfMonth, 10),
            category: form.category,
          }),
        });
      }
      closeModal();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(sub: Subscription) {
    await fetch(`/api/subscriptions/${sub.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !sub.isActive }),
    });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    load();
  }

  const totalMonthly = subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.amount, 0);

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

  const accentColor = "#dc2626";

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
    <main
      className="min-h-screen px-4 py-4 md:px-12 pb-24 max-w-[1400px] mx-auto"
      style={{ background: "#f5f5f5", direction: "rtl" }}
    >
      {/* Page title */}
      <div style={{ marginTop: "24px", marginBottom: "16px" }}>
        <h1
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#111111",
          }}
        >
          מנויים חודשיים 📦
        </h1>
      </div>

      {/* Monthly total KPI card */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e8e8e8",
          borderTopColor: "#dc2626",
          borderTopWidth: "3px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          padding: "20px 28px",
          marginBottom: "20px",
          display: "inline-block",
          minWidth: "240px",
        }}
      >
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#9ca3af",
            marginBottom: "12px",
          }}
        >
          סה״כ מנויים
        </p>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: "1.75rem",
            color: "#dc2626",
            lineHeight: 1,
            display: "flex",
            alignItems: "flex-start",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "1rem",
              fontWeight: 400,
              color: "#dc2626",
              marginTop: "5px",
              opacity: 0.8,
            }}
          >
            ₪
          </span>
          {totalMonthly.toLocaleString("he-IL")}
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 400,
              color: "#9ca3af",
              alignSelf: "flex-end",
              marginBottom: "2px",
              marginRight: "4px",
            }}
          >
            / חודש
          </span>
        </p>
      </div>

      {/* Subscriptions list card */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e8e8e8",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* List header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
            מנויים ({subscriptions.length})
          </p>
          <button
            onClick={openAdd}
            style={{
              background: "#00875a",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "0.85rem",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#006644")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#00875a")}
          >
            + הוסף מנוי
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "0.875rem",
              fontFamily: "Inter, sans-serif",
            }}
          >
            אין מנויים עדיין
          </div>
        ) : (
          subscriptions.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              sub={sub}
              onEdit={() => openEdit(sub)}
              onDelete={() => handleDelete(sub.id)}
              onToggle={() => handleToggle(sub)}
            />
          ))
        )}
      </div>

      {/* Add / Edit modal */}
      {modal.open && (
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
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div style={modalStyle}>
            {/* Mobile drag handle */}
            {isMobile && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                <div
                  style={{ width: "40px", height: "4px", background: "#e8e8e8", borderRadius: "2px" }}
                />
              </div>
            )}

            {/* Modal header */}
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
                {modal.editing ? "עריכת מנוי" : "מנוי חדש"}
              </h2>
              <button
                onClick={closeModal}
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

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Name */}
              <div>
                <label style={labelStyle}>שם</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Netflix, גים..."
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e8e8e8")}
                />
              </div>

              {/* Amount */}
              <div>
                <label style={labelStyle}>סכום (₪)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0"
                  style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e8e8e8")}
                />
              </div>

              {/* Day of month */}
              <div>
                <label style={labelStyle}>יום בחודש (1–31)</label>
                <input
                  type="number"
                  value={form.dayOfMonth}
                  onChange={(e) => setForm((f) => ({ ...f, dayOfMonth: e.target.value }))}
                  required
                  min="1"
                  max="31"
                  placeholder="1"
                  style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e8e8e8")}
                />
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>קטגוריה</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="מנוי"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e8e8e8")}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: accentColor,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  fontFamily: "Inter, sans-serif",
                  opacity: saving ? 0.7 : 1,
                  transition: "background 0.15s, opacity 0.15s",
                  marginTop: "4px",
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.background = "#b91c1c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = accentColor;
                }}
              >
                {saving ? "שומר..." : modal.editing ? "שמור שינויים" : "הוסף מנוי"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
