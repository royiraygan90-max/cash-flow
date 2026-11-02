import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { findRule } from "@/lib/merchantRules";
import { parseCardSms, type ParsedSms } from "@/lib/smsParse";

export const SMS_SOURCE = "sms";
const MAX_TEXT = 2000;
/** Where a charge sits in the totals until the user has chosen its category. */
export const UNREVIEWED_CATEGORY = "אחר";

/** The same message re-sent within this long is the phone retrying, not a second purchase. */
const RETRY_WINDOW_MS = 10 * 60 * 1000;

/** What the message says, without when it arrived. */
function smsFingerprint(parsed: ParsedSms): string {
  const basis = [parsed.last4, parsed.date, parsed.amount.toFixed(2), parsed.merchant.toLowerCase()].join("|");
  return createHash("sha256").update(basis).digest("hex").slice(0, 32);
}

/**
 * The SMS has no transaction id. When the phone sends `receivedAt`, the id is the message
 * plus that moment: re-sending maps to the same row, and two identical purchases on one day
 * stay apart. Without it, the id is the message plus the time it reached us, and a repeat
 * within RETRY_WINDOW_MS is treated as a retry instead (see applySms).
 */
export function smsExternalId(parsed: ParsedSms, receivedAt: string | null, now: Date): string {
  const fingerprint = smsFingerprint(parsed);
  if (receivedAt === null) return `${fingerprint}:${now.getTime()}`;
  return createHash("sha256").update(`${fingerprint}|${receivedAt}`).digest("hex").slice(0, 32);
}

export type SmsRequest = { text: string; receivedAt: string | null };

/**
 * Either the raw message text (what a Shortcut sends as a plain body), or JSON
 * `{ text, receivedAt? }`. Returns null when it isn't a well-formed request.
 */
export function parseSmsRequest(body: unknown): SmsRequest | null {
  if (typeof body === "string") {
    return body.trim() && body.length <= MAX_TEXT ? { text: body, receivedAt: null } : null;
  }
  if (!body || typeof body !== "object") return null;
  const { text, receivedAt } = body as Record<string, unknown>;
  if (typeof text !== "string" || !text.trim() || text.length > MAX_TEXT) return null;
  // Whatever date format the phone produces, only keep it as an identity string
  const received = typeof receivedAt === "string" && receivedAt.trim() ? receivedAt.trim().slice(0, 64) : null;
  return { text, receivedAt: received };
}

export type SmsOutcome =
  | { status: "created"; id: string; date: string; amount: number; description: string; category: string; needsReview: boolean }
  | { status: "duplicate"; id: string }
  | { status: "duplicate-of-manual"; existing: { id: string; category: string; description: string } }
  | { status: "unparsed"; reason: string };

export async function applySms(userId: string, req: SmsRequest, now: Date = new Date()): Promise<SmsOutcome> {
  const parsed = parseCardSms(req.text, now);
  if (!parsed.ok) return { status: "unparsed", reason: parsed.reason };
  const sms = parsed.value;

  const externalId = smsExternalId(sms, req.receivedAt, now);
  if (req.receivedAt === null) {
    const retry = await prisma.transaction.findFirst({
      where: {
        userId,
        source: SMS_SOURCE,
        externalId: { startsWith: `${smsFingerprint(sms)}:` },
        createdAt: { gte: new Date(now.getTime() - RETRY_WINDOW_MS) },
      },
      select: { id: true },
    });
    if (retry) return { status: "duplicate", id: retry.id };
  }
  const key = { userId_source_externalId: { userId, source: SMS_SOURCE, externalId } };

  // Never overwrite: the user may have changed the category since the first time it arrived
  const already = await prisma.transaction.findUnique({ where: key, select: { id: true } });
  if (already) return { status: "duplicate", id: already.id };

  const dayStart = new Date(sms.date);
  const nextDay = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const entered = await prisma.transaction.findFirst({
    where: { userId, type: "expense", source: null, amount: sms.amount, date: { gte: dayStart, lt: nextDay } },
    select: { id: true, category: true, description: true },
  });
  if (entered) return { status: "duplicate-of-manual", existing: entered };

  // A rule for this merchant (and amount) files it straight away; anything else waits for the user
  const rule = await findRule(userId, sms.merchant, sms.amount);
  const description = (rule?.note.trim() || sms.merchant).slice(0, 200);
  const category = rule?.category ?? UNREVIEWED_CATEGORY;
  const needsReview = rule === null;

  const created = await prisma.transaction.create({
    data: {
      date: dayStart,
      type: "expense",
      category,
      // While it waits for review the description stays the merchant name, which is what the rule is made from
      description,
      amount: sms.amount,
      userId,
      source: SMS_SOURCE,
      externalId,
      needsReview,
      // Filed by a rule without the user seeing it: tell them on the dashboard
      unseen: !needsReview,
    },
  });

  return { status: "created", id: created.id, date: sms.date, amount: sms.amount, description, category, needsReview };
}
