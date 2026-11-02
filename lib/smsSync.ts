import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { guessCategoryFromKeywords } from "@/lib/merchantCategory";
import { parseCardSms, type ParsedSms } from "@/lib/smsParse";

export const SMS_SOURCE = "sms";
const MAX_TEXT = 2000;
const FALLBACK_CATEGORY = "אחר";

/** What the user filed this merchant under before, if anything — their own choice outranks keyword guesses. */
async function categoryUsedBefore(userId: string, merchant: string): Promise<string | null> {
  const previous = await prisma.transaction.findFirst({
    where: { userId, type: "expense", description: { equals: merchant, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    select: { category: true },
  });
  return previous?.category ?? null;
}

/**
 * The SMS has no transaction id, so identify it by what it says plus when it arrived.
 * Re-sending the same message maps to the same row; two identical purchases on one day
 * stay apart because their messages arrived at different moments.
 */
export function smsExternalId(parsed: ParsedSms, receivedAt: string | null): string {
  const basis = [parsed.last4, parsed.date, parsed.amount.toFixed(2), parsed.merchant.toLowerCase(), receivedAt ?? ""].join("|");
  return createHash("sha256").update(basis).digest("hex").slice(0, 32);
}

export type SmsRequest = { text: string; receivedAt: string | null };

/** Returns null when the body isn't a well-formed request. */
export function parseSmsRequest(body: unknown): SmsRequest | null {
  if (!body || typeof body !== "object") return null;
  const { text, receivedAt } = body as Record<string, unknown>;
  if (typeof text !== "string" || !text.trim() || text.length > MAX_TEXT) return null;
  // Whatever date format the phone produces, only keep it as an identity string
  const received = typeof receivedAt === "string" && receivedAt.trim() ? receivedAt.trim().slice(0, 64) : null;
  return { text, receivedAt: received };
}

export type SmsOutcome =
  | { status: "created"; id: string; date: string; amount: number; description: string; category: string; categorySource: "history" | "keywords" | "default" }
  | { status: "duplicate"; id: string }
  | { status: "duplicate-of-manual"; existing: { id: string; category: string; description: string } }
  | { status: "unparsed"; reason: string };

export async function applySms(userId: string, req: SmsRequest, now: Date = new Date()): Promise<SmsOutcome> {
  const parsed = parseCardSms(req.text, now);
  if (!parsed.ok) return { status: "unparsed", reason: parsed.reason };
  const sms = parsed.value;

  const externalId = smsExternalId(sms, req.receivedAt);
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

  const remembered = await categoryUsedBefore(userId, sms.merchant);
  const guessed = remembered ? null : guessCategoryFromKeywords(sms.merchant);
  const category = remembered ?? guessed ?? FALLBACK_CATEGORY;

  const created = await prisma.transaction.create({
    data: {
      date: dayStart,
      type: "expense",
      category,
      description: sms.merchant.slice(0, 200),
      amount: sms.amount,
      userId,
      source: SMS_SOURCE,
      externalId,
    },
  });

  return {
    status: "created",
    id: created.id,
    date: sms.date,
    amount: sms.amount,
    description: created.description,
    category,
    categorySource: remembered ? "history" : guessed ? "keywords" : "default",
  };
}
