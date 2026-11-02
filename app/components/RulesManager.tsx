"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import { EXPENSE_CATEGORIES } from "./AddTransactionModal";
import { useToast } from "./Toast";

export interface Rule {
  id: string;
  merchant: string;
  amount: number | null;
  category: string;
  note: string;
}

const font = { fontFamily: "Rubik, sans-serif" } as const;

const input: React.CSSProperties = {
  ...font,
  width: "100%",
  background: "#0b0e13",
  border: "1px solid #1b212a",
  color: "#f2f5f8",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 16,
  outline: "none",
  direction: "rtl",
};

const label: React.CSSProperties = { ...font, fontSize: 12, color: "#7c8896", marginBottom: 6, display: "block" };

/** The form for one rule, used both to add a new one and to change an existing one. */
function RuleForm({ initial, onSaved, onCancel }: { initial?: Rule; onSaved: () => void; onCancel: () => void }) {
  const { showToast } = useToast();
  const [merchant, setMerchant] = useState(initial?.merchant ?? "");
  const [amount, setAmount] = useState(initial?.amount != null ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [busy, setBusy] = useState(false);

  const canSave = merchant.trim() !== "" && category !== "";

  async function save() {
    if (!canSave) return;
    setBusy(true);
    try {
      const res = await fetch(initial ? `/api/merchant-rules/${initial.id}` : "/api/merchant-rules", {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant, amount: amount.trim() === "" ? null : amount, category, note }),
      });
      if (res.status === 409) {
        showToast({ type: "error", message: "כבר יש כלל כזה", detail: "אותו בית עסק ואותו סכום" });
        return;
      }
      if (!res.ok) throw new Error("save failed");
      const data = await res.json();
      showToast({
        type: "success",
        message: initial ? "הכלל עודכן" : "הכלל נשמר",
        detail: data.settled > 0 ? `${data.settled} חיובים שהמתינו סווגו לפיו` : undefined,
      });
      onSaved();
    } catch {
      showToast({ type: "error", message: "השמירה נכשלה", detail: "בדוק את החיבור ונסה שוב" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <span style={label}>בית עסק (כפי שמופיע בהודעה)</span>
      <input style={input} value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="למשל: רותם אפרים הייר דיזי" />

      <span style={{ ...label, marginTop: 12 }}>סכום (ריק = כל סכום)</span>
      <input
        style={{ ...input, direction: "ltr", textAlign: "right" }}
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="כל סכום"
      />

      <span style={{ ...label, marginTop: 12 }}>קטגוריה</span>
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

      <span style={{ ...label, marginTop: 12 }}>הערה</span>
      <input style={input} value={note} onChange={(e) => setNote(e.target.value)} placeholder="למשל: תספורת" />

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button
          type="button"
          disabled={!canSave || busy}
          onClick={save}
          style={{
            ...font,
            flex: 1,
            padding: "11px 0",
            borderRadius: 12,
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: canSave && !busy ? "pointer" : "default",
            background: canSave ? "#34e0a1" : "#1b212a",
            color: canSave ? "#04170f" : "#6b7785",
          }}
        >
          שמור
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{ ...font, padding: "11px 18px", borderRadius: 12, border: "1px solid #1b212a", background: "transparent", color: "#9aa6b4", fontSize: 14, cursor: "pointer" }}
        >
          ביטול
        </button>
      </div>
    </div>
  );
}

function RuleRow({ rule, onChanged }: { rule: Rule; onChanged: () => void }) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const c = CATEGORY_COLORS[rule.category] ?? DEFAULT_CATEGORY_COLOR;

  async function remove() {
    if (!window.confirm(`למחוק את הכלל של "${rule.merchant}"?\nחיובים שכבר נקלטו לא ישתנו.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/merchant-rules/${rule.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      onChanged();
    } catch {
      showToast({ type: "error", message: "המחיקה נכשלה", detail: "בדוק את החיבור ונסה שוב" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ background: "#11151b", border: "1px solid #1b212a", borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <p style={{ ...font, fontSize: 14, fontWeight: 500, color: "#f2f5f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {rule.merchant}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ ...font, fontSize: 11, color: c.color, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 999, padding: "2px 9px" }}>
              {rule.category}
            </span>
            {rule.note && <span style={{ ...font, fontSize: 12, color: "#9aa6b4" }}>{rule.note}</span>}
          </div>
        </div>
        <span dir="ltr" style={{ ...font, fontSize: 13, color: rule.amount === null ? "#7c8896" : "#f2f5f8", whiteSpace: "nowrap" }}>
          {rule.amount === null ? "כל סכום" : `₪${rule.amount.toLocaleString("he-IL")}`}
        </span>
      </div>

      {editing ? (
        <RuleForm
          initial={rule}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onChanged();
          }}
        />
      ) : (
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={{ ...font, flex: 1, padding: "8px 0", borderRadius: 10, border: "1px solid #1b212a", background: "transparent", color: "#52b9ff", fontSize: 13, cursor: "pointer" }}
          >
            ערוך
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            style={{ ...font, flex: 1, padding: "8px 0", borderRadius: 10, border: "1px solid #3a2a2a", background: "transparent", color: "#f87171", fontSize: 13, cursor: "pointer" }}
          >
            מחק
          </button>
        </div>
      )}
    </div>
  );
}

/** The saved rules for card charges: what each merchant is filed as, with add, edit and delete. */
export default function RulesManager({ rules }: { rules: Rule[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);

  const refresh = () => startTransition(() => router.refresh());

  return (
    <div style={{ paddingTop: 24 }}>
      <h1 style={{ ...font, fontSize: 20, fontWeight: 600, color: "#f2f5f8" }}>כללי סיווג</h1>
      <p style={{ ...font, fontSize: 12, color: "#7c8896", marginTop: 6, marginBottom: 16, lineHeight: 1.6 }}>
        חיוב אשראי מבית עסק שיש לו כלל נכנס ישר לקטגוריה ולהערה. כלל חל על חיובים חדשים ועל אלה שמחכים לסיווג,
        ולא משנה חיובים שכבר סווגו.
      </p>

      <div style={{ background: "#11151b", border: "1px solid #1b212a", borderRadius: 16, padding: "14px 16px", marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          style={{ ...font, width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "right", color: "#34e0a1", fontSize: 14, fontWeight: 500, padding: 0 }}
        >
          {adding ? "סגור" : "+ הוסף כלל"}
        </button>
        {adding && (
          <RuleForm
            onCancel={() => setAdding(false)}
            onSaved={() => {
              setAdding(false);
              refresh();
            }}
          />
        )}
      </div>

      {rules.length === 0 ? (
        <p style={{ ...font, fontSize: 13, color: "#6b7785", textAlign: "center", marginTop: 32 }}>
          עוד אין כללים. הם נוצרים כשמסווגים חיוב ומשאירים &quot;זכור לפעם הבאה&quot;, או מכאן.
        </p>
      ) : (
        rules.map((r) => <RuleRow key={r.id} rule={r} onChanged={refresh} />)
      )}
    </div>
  );
}
