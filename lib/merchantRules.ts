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
