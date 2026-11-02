import { prisma } from "@/lib/prisma";

/** Same merchant however the SMS happens to space or capitalise it. */
export function normalizeMerchant(name: string): string {
  return name.replace(/\s+/g, " ").trim().toLowerCase();
}

const sameAmount = (a: number, b: number) => Math.abs(a - b) < 0.005;

/**
 * The rule for this charge: one for this merchant and exactly this amount, else one for
 * the merchant at any amount. Null when nothing matches, and the charge goes to review.
 */
export async function findRule(userId: string, merchant: string, amount: number) {
  const rules = await prisma.merchantRule.findMany({
    where: { userId, merchant: normalizeMerchant(merchant) },
    orderBy: { createdAt: "desc" },
  });
  return (
    rules.find((r) => r.amount !== null && sameAmount(r.amount, amount)) ??
    rules.find((r) => r.amount === null) ??
    null
  );
}

/** Creates the rule, or replaces the category and note of an existing one for the same merchant and amount. */
export async function saveRule(
  userId: string,
  rule: { merchant: string; amount: number | null; category: string; note: string },
) {
  const merchant = normalizeMerchant(rule.merchant);
  const existing = await prisma.merchantRule.findFirst({
    where: { userId, merchant, amount: rule.amount },
  });
  if (existing) {
    return prisma.merchantRule.update({ where: { id: existing.id }, data: { category: rule.category, note: rule.note } });
  }
  return prisma.merchantRule.create({
    data: { userId, merchant, amount: rule.amount, category: rule.category, note: rule.note },
  });
}

/** Only the rule's own fields, checked: what a request to create or change a rule may carry. */
export type RuleFields = { merchant: string; amount: number | null; category: string; note: string };

/** Returns null when the body isn't a well-formed rule. An empty or missing amount means any amount. */
export function parseRuleFields(body: unknown): RuleFields | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const merchant = typeof b.merchant === "string" ? normalizeMerchant(b.merchant).slice(0, 200) : "";
  const category = typeof b.category === "string" ? b.category.trim().slice(0, 60) : "";
  const note = typeof b.note === "string" ? b.note.trim().slice(0, 200) : "";
  if (!merchant || !category) return null;

  let amount: number | null = null;
  if (b.amount !== null && b.amount !== undefined && b.amount !== "") {
    amount = typeof b.amount === "number" ? b.amount : Number(b.amount);
    if (!Number.isFinite(amount) || amount <= 0) return null;
  }
  return { merchant, amount, category, note };
}

/**
 * Files the charges that are waiting for review and match this rule (same merchant, and the
 * same amount unless the rule covers any amount). Charges already filed are left alone.
 */
export async function settleWaiting(userId: string, rule: RuleFields) {
  const waiting = await prisma.transaction.findMany({
    where: { userId, needsReview: true, ...(rule.amount === null ? {} : { amount: rule.amount }) },
    select: { id: true, description: true, amount: true },
  });
  const merchant = normalizeMerchant(rule.merchant);
  const matching = waiting.filter(
    (w) => normalizeMerchant(w.description) === merchant && (rule.amount === null || sameAmount(w.amount, rule.amount)),
  );
  for (const w of matching) {
    await prisma.transaction.update({
      where: { id: w.id },
      data: { category: rule.category, description: rule.note || w.description, needsReview: false },
    });
  }
  return matching.length;
}
