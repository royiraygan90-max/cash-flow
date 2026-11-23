import type { SmsOutcome } from "@/lib/smsSync";

const money = (n: number) => `₪${n.toLocaleString("he-IL")}`;

function whyNotParsed(reason: string): string {
  if (reason === "refund-or-cancellation") return "זיכוי או ביטול. כדאי להזין אותו ידנית";
  if (reason.startsWith("unsupported-currency")) return "לא זיהיתי את המטבע בהודעה. כדאי להזין אותו ידנית";
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
    case "created": {
      // A charge in another currency shows what the message said, and that the shekel figure is a guess
      const sum = outcome.foreign
        ? `${outcome.foreign.currency} ${outcome.foreign.amount.toLocaleString("he-IL")} (כ-${money(outcome.amount)}, משוער)`
        : money(outcome.amount);
      return outcome.needsReview
        ? `חיוב חדש מחכה לסיווג: ${outcome.description} · ${sum}`
        : `נוסף חיוב: ${outcome.description} · ${outcome.category} · ${sum}`;
    }
    case "ignored":
      return `לא נוסף, סימנת לדלג עליו: ${outcome.merchant}`;
    case "duplicate":
      return "ההודעה הזאת כבר נקלטה";
    case "duplicate-of-manual":
      return "כבר יש הוצאה כזאת שהוזנה ידנית, לא נוספה שוב";
    case "unparsed":
      return `לא נקלט: ${whyNotParsed(outcome.reason)}`;
  }
}
