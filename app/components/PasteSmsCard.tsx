"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";

const font = { fontFamily: "Rubik, sans-serif" } as const;

const UNPARSED: Record<string, string> = {
  "refund-or-cancellation": "זיכוי או ביטול. כדאי להזין אותו ידנית",
  "invalid-date": "התאריך בהודעה לא תקין",
  "invalid-amount": "הסכום בהודעה לא תקין",
  "missing-merchant": "לא נמצא שם בית עסק בהודעה",
};

function unparsedMessage(reason: string): string {
  if (reason.startsWith("unsupported-currency")) return "חיוב במטבע שאינו שקל. כדאי להזין אותו ידנית";
  return UNPARSED[reason] ?? "לא הצלחתי לקרוא את ההודעה. ודא שהעתקת את כולה";
}

/** Paste a card-charge SMS to add it as an expense, without the phone automation. */
export default function PasteSmsCard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/sms/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 422 && data?.status === "unparsed") {
        showToast({ type: "error", message: "ההודעה לא נקלטה", detail: unparsedMessage(String(data.reason)) });
        return;
      }
      if (!res.ok || !data) throw new Error("paste failed");

      if (data.status === "created") {
        showToast({
          type: "success",
          message: data.needsReview ? "נוסף וממתין לסיווג" : "ההוצאה נוספה",
          detail: `₪${Number(data.amount).toLocaleString("he-IL")} · ${data.description}`,
        });
      } else if (data.status === "duplicate") {
        showToast({ type: "success", message: "ההודעה הזאת כבר נקלטה", detail: "לא נוספה הוצאה נוספת" });
      } else {
        showToast({ type: "success", message: "כבר יש הוצאה כזאת", detail: "הוזנה ידנית באותו יום ובאותו סכום" });
      }
      setText("");
      setOpen(false);
      startTransition(() => router.refresh());
    } catch {
      showToast({ type: "error", message: "השמירה נכשלה", detail: "בדוק את החיבור ונסה שוב" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        background: "#11151b",
        border: "1px solid #1b212a",
        borderRadius: 20,
        padding: "14px 16px",
        marginBottom: 12,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ ...font, width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "right", color: "#52b9ff", fontSize: 14, fontWeight: 500, padding: 0 }}
      >
        {open ? "סגור" : "הדבק הודעת אשראי"}
      </button>

      {open && (
        <div style={{ marginTop: 12 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="הדבק כאן את ההודעה מישראכרט"
            rows={4}
            style={{
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
              resize: "vertical",
            }}
          />
          <button
            type="button"
            disabled={!text.trim() || busy}
            onClick={submit}
            style={{
              ...font,
              width: "100%",
              marginTop: 10,
              padding: "11px 0",
              borderRadius: 12,
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: text.trim() && !busy ? "pointer" : "default",
              background: text.trim() ? "#52b9ff" : "#1b212a",
              color: text.trim() ? "#06121c" : "#6b7785",
            }}
          >
            הוסף הוצאה
          </button>
        </div>
      )}
    </div>
  );
}
