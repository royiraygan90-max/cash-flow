/**
 * Parses a card-charge SMS (Isracard wording) into a transaction.
 *
 *   שלום, בכרטיסך המסתיים ב-2975, אושרה עסקה ב-01/11 בסך 90.00 ש"ח ברותם אפרים הייר דיזי.
 *   למידע נוסף באפליקציה ובאתר: https://...  לשירותך, ישראכרט
 *
 * Returns a reason instead of guessing when the text is not a plain shekel purchase
 * (foreign currency, refunds, a different wording), so the caller can report it.
 */

export type ParsedSms = {
  last4: string;
  /** Calendar day, yyyy-mm-dd */
  date: string;
  amount: number;
  merchant: string;
};

export type SmsParseResult = { ok: true; value: ParsedSms } | { ok: false; reason: string };

// Direction marks and other invisible characters that SMS apps and Shortcuts sprinkle into Hebrew text
const INVISIBLE = /[‎‏‪-‮⁦-⁩﻿]/g;

const SHEKEL = /^(?:ש["״”]ח|שח|₪|ILS)$/i;

const PURCHASE =
  /בכרטיסך המסתיים ב-?\s*(\d{4})\s*,?\s*אושרה עסקה ב-?\s*(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s+בסך\s+([\d,]+(?:\.\d+)?)\s+(\S+)\s+([\s\S]*?)\s*(?:\.\s*)?(?:למידע נוסף|$)/;

const pad = (n: number) => String(n).padStart(2, "0");

/** Today's date in Israel, as year/month/day numbers. */
function israelToday(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/**
 * The SMS carries day and month only. Pick the year that puts the date closest to
 * `now` without being in the future, so a 30/12 message read on 02/01 is last year.
 */
function inferYear(day: number, month: number, now: Date): number {
  const today = israelToday(now);
  const thisYear = new Date(Date.UTC(today.year, month - 1, day));
  const todayDate = new Date(Date.UTC(today.year, today.month - 1, today.day));
  // A day of slack for clock skew between the phone and the server
  const limit = new Date(todayDate.getTime() + 24 * 60 * 60 * 1000);
  return thisYear > limit ? today.year - 1 : today.year;
}

function isRealDay(year: number, month: number, day: number) {
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

const OPENING = "בכרטיסך המסתיים";

/**
 * An iOS automation can hand over the same message twice in a row, with nothing between
 * them. Keep only the first one, or the merchant would swallow the second copy.
 */
function firstCopy(text: string): string {
  const first = text.indexOf(OPENING);
  const second = first === -1 ? -1 : text.indexOf(OPENING, first + OPENING.length);
  if (second === -1) return text;
  // A greeting ("שלום,") right before the second copy belongs to it, not to the first
  return text.slice(0, second).replace(/\s*שלום,?\s*$/, "");
}

export function parseCardSms(text: string, now: Date = new Date()): SmsParseResult {
  const clean = firstCopy(text.replace(INVISIBLE, "").replace(/\s+/g, " ").trim());

  if (/זיכוי|בוטל|ביטול עסקה/.test(clean)) return { ok: false, reason: "refund-or-cancellation" };

  const m = PURCHASE.exec(clean);
  if (!m) return { ok: false, reason: "unrecognized-format" };

  const [, last4, dayStr, monthStr, yearStr, amountStr, currency, rawMerchant] = m;
  if (!SHEKEL.test(currency)) return { ok: false, reason: `unsupported-currency:${currency}` };

  const day = Number(dayStr);
  const month = Number(monthStr);
  let year = inferYear(day, month, now);
  if (yearStr) year = yearStr.length === 2 ? 2000 + Number(yearStr) : Number(yearStr);
  if (month < 1 || month > 12 || !isRealDay(year, month, day)) return { ok: false, reason: "invalid-date" };

  const amount = Number(amountStr.replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, reason: "invalid-amount" };

  // The merchant is glued to the Hebrew preposition "ב" ("ב" + "חנות"), which is not part of its name
  const merchant = rawMerchant.replace(/^ב/, "").replace(/[.\s]+$/, "").trim();
  if (!merchant) return { ok: false, reason: "missing-merchant" };

  return { ok: true, value: { last4, date: `${year}-${pad(month)}-${pad(day)}`, amount, merchant } };
}
