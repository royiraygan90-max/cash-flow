import type { SmsOutcome } from "@/lib/smsSync";

const money = (n: number) => `₪${n.toLocaleString("he-IL")}`;

function whyNotParsed(reason: string): string {
  if (reason === "refund-or-cancellation") return "זיכוי או ביטול. כדאי להזין אותו ידנית";
  if (reason.startsWith("unsupported-currency")) return "חיוב במטבע שאינו שקל. כדאי להזין אותו ידנית";
  if (reason === "invalid-date" || reason === "invalid-amount" || reason === "missing-merchant") {
    return "חסר או לא תקין פרט בהודעה. כדאי להזין אותו ידנית";
  }
  return "לא הצלחתי לקרוא את ההודעה";
}

/**
 * One line for the phone to show as a notification, saying what happened to the message.
 * Used when the Shortcut asks for plain text, so it needs no JSON handling on the phone.
 */
export function outcomeText(outcome: SmsOutcome): string {
  switch (outcome.status) {
    case "created":
      return outcome.needsReview
        ? `חיוב חדש מחכה לסיווג: ${outcome.description} · ${money(outcome.amount)}`
        : `נוסף חיוב: ${outcome.description} · ${outcome.category} · ${money(outcome.amount)}`;
    case "duplicate":
      return "ההודעה הזאת כבר נקלטה";
    case "duplicate-of-manual":
      return "כבר יש הוצאה כזאת שהוזנה ידנית, לא נוספה שוב";
    case "unparsed":
      return `לא נקלט: ${whyNotParsed(outcome.reason)}`;
  }
}
