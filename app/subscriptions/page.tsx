"use client";

import { useState, useEffect, useCallback } from "react";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import Icon from "@/app/components/Icon";

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
  sub, onEdit, onDelete, onToggle,
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
        borderBottom: "1px solid #161b22",
        padding: "12px 16px",
        direction: "rtl",
        gap: 10,
        opacity: sub.isActive ? 1 : 0.45,
        transition: "background 0.1s, opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#20272f")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Icon chip */}
      <div
        style={{
          width: 38, height: 38, borderRadius: 12,
          background: c.bg, color: c.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={c.icon} size={20} />
      </div>

      {/* Name + day */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#f2f5f8", fontFamily: "Rubik, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {sub.name}
        </p>
        <p style={{ fontSize: 11, color: "#6b7785", fontFamily: "Rubik, sans-serif", marginTop: 2 }}>
          כל ה-{sub.dayOfMonth} לחודש
        </p>
      </div>

      {/* Amount */}
      <span
        dir="ltr"
        style={{ fontSize: 14, fontWeight: 600, color: "#ff8f8f", fontFamily: "Rubik, sans-serif", flexShrink: 0 }}
      >
        −₪{sub.amount.toLocaleString("he-IL")}
      </span>

      {/* Toggle */}
      <button
        onClick={onToggle}
        style={{
          background: sub.isActive ? "rgba(52,224,161,.12)" : "#161b22",
          border: `1px solid ${sub.isActive ? "#1c3329" : "#20272f"}`,
          color: sub.isActive ? "#34e0a1" : "#5c6776",
          borderRadius: 99,
          padding: "4px 10px",
          fontSize: 11,
          fontFamily: "Rubik, sans-serif",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {sub.isActive ? "פעיל" : "כבוי"}
      </button>

      {/* Edit */}
      <button
        onClick={onEdit}
        className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
        style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6776", padding: 4, display: "flex", alignItems: "center", transition: "color 0.1s" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#34e0a1")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#5c6776")}
      >
        <Icon name="edit" size={16} />
      </button>

      {/* Delete */}
      {confirm ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#ff6b6b", fontSize: 12, fontFamily: "Rubik, sans-serif", padding: 0 }}>כן</button>
          <button onClick={() => setConfirm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6776", fontSize: 12, padding: 0 }}>לא</button>
        </div>
      ) : (
        <button
          onClick={() => setConfirm(true)}
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6776", padding: 4, display: "flex", alignItems: "center", transition: "color 0.1s", flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6b6b")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#5c6776")}
        >
          <Icon name="delete" size={16} />
        </button>
      )}
    </div>
  );
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing: Subscription | null }>({ open: false, editing: null });
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

  useEffect(() => { load(); }, [load]);

  const closeModal = useCallback(() => setModal({ open: false, editing: null }), []);

  useEffect(() => {
    if (!modal.open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal.open, closeModal]);

  function openAdd() { setForm(DEFAULT_FORM); setModal({ open: true, editing: null }); }
  function openEdit(sub: Subscription) {
    setForm({ name: sub.name, amount: String(sub.amount), dayOfMonth: String(sub.dayOfMonth), category: sub.category });
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
          body: JSON.stringify({ name: form.name, amount: parseFloat(form.amount), dayOfMonth: parseInt(form.dayOfMonth, 10), category: form.category }),
        });
      } else {
        await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, amount: parseFloat(form.amount), dayOfMonth: parseInt(form.dayOfMonth, 10), category: form.category }),
        });
      }
      closeModal(); load();
    } finally { setSaving(false); }
  }

  async function handleToggle(sub: Subscription) {
    await fetch(`/api/subscriptions/${sub.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !sub.isActive }) });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    load();
  }

  const activeTotal   = subscriptions.filter((s) => s.isActive).reduce((sum, s) => sum + s.amount, 0);
  const yearlyTotal   = activeTotal * 12;

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
    ? { position: "fixed", bottom: 0, left: 0, right: 0, background: "#0d1014", borderRadius: "28px 28px 0 0", boxShadow: "0 -8px 40px rgba(0,0,0,0.6)", padding: "24px 20px calc(24px + env(safe-area-inset-bottom))", maxHeight: "92vh", overflowY: "auto" }
    : { background: "#0d1014", border: "1px solid #20272f", borderRadius: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", padding: "32px", width: "100%", maxWidth: 460 };

  return (
    <main
      style={{
        background: "var(--bg-primary)",
        minHeight: "100vh",
        padding: "0 18px 80px",
        maxWidth: 640,
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      {/* Page header */}
      <div style={{ marginTop: 20, marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
          מנויים
        </h1>
      </div>

      {/* Hero card */}
      <div
        style={{
          background: "linear-gradient(155deg, #171d26, #10151c)",
          border: "1px solid #20272f",
          borderRadius: 28,
          padding: 24,
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 12, color: "#7c8896", marginBottom: 8, fontFamily: "Rubik, sans-serif" }}>
          סה״כ הוצאות מנויים
        </p>
        <p
          dir="ltr"
          style={{ fontSize: 46, fontWeight: 600, color: "#818cf8", lineHeight: 1, fontFamily: "Rubik, sans-serif", display: "inline-block" }}
        >
          ₪{activeTotal.toLocaleString("he-IL")}
        </p>
        <p style={{ fontSize: 12, color: "#6b7785", marginTop: 6, fontFamily: "Rubik, sans-serif" }}>
          לחודש · <span dir="ltr">₪{yearlyTotal.toLocaleString("he-IL")}</span> לשנה
        </p>
      </div>

      {/* List card */}
      <div
        style={{
          background: "#1b2230",
          border: "1px solid #20272f",
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        {/* List header */}
        <div
          style={{
            padding: "16px 16px",
            borderBottom: "1px solid #161b22",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            direction: "rtl",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
            מנויים ({subscriptions.length})
          </span>
          <button
            onClick={openAdd}
            style={{
              background: "#34e0a1",
              color: "#06231a",
              border: "none",
              borderRadius: 10,
              padding: "7px 14px",
              fontSize: 13,
              fontFamily: "Rubik, sans-serif",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + הוסף מנוי
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#6b7785", fontSize: 14, fontFamily: "Rubik, sans-serif" }}>
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
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 50,
            padding: isMobile ? 0 : 16,
            direction: "rtl",
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div style={modalStyle}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <button
                onClick={closeModal}
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#161b22", border: "none", color: "#9aa6b4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon name="close" size={18} />
              </button>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
                {modal.editing ? "עריכת מנוי" : "מנוי חדש"}
              </h2>
              <div style={{ width: 34 }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Name */}
              <div style={pillRow}>
                <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>שם</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Netflix, גים..."
                  style={{ background: "transparent", border: "none", outline: "none", color: "#f2f5f8", fontSize: 16, fontFamily: "Rubik, sans-serif", textAlign: "left", flex: 1, direction: "ltr" }}
                />
              </div>

              {/* Amount */}
              <div style={pillRow}>
                <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>סכום ₪</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  required min="0" step="0.01" placeholder="0"
                  style={{ background: "transparent", border: "none", outline: "none", color: "#f2f5f8", fontSize: 16, fontFamily: "Rubik, sans-serif", textAlign: "left", flex: 1, direction: "ltr" }}
                />
              </div>

              {/* Day of month */}
              <div style={pillRow}>
                <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>יום בחודש</span>
                <input
                  type="number"
                  value={form.dayOfMonth}
                  onChange={(e) => setForm((f) => ({ ...f, dayOfMonth: e.target.value }))}
                  required min="1" max="31" placeholder="1"
                  style={{ background: "transparent", border: "none", outline: "none", color: "#f2f5f8", fontSize: 16, fontFamily: "Rubik, sans-serif", textAlign: "left", flex: 1, direction: "ltr" }}
                />
              </div>

              {/* Category */}
              <div style={pillRow}>
                <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>קטגוריה</span>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="מנוי"
                  style={{ background: "transparent", border: "none", outline: "none", color: "#f2f5f8", fontSize: 16, fontFamily: "Rubik, sans-serif", textAlign: "left", flex: 1, direction: "ltr" }}
                />
              </div>

              {/* Save */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%", padding: 16,
                  background: "#34e0a1", color: "#06231a",
                  border: "none", borderRadius: 16,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 600, fontSize: 16, fontFamily: "Rubik, sans-serif",
                  opacity: saving ? 0.7 : 1, marginTop: 4,
                  transition: "opacity 0.15s",
                }}
              >
                {saving ? "שומר..." : modal.editing ? "שמירת שינויים" : "הוסף מנוי"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
