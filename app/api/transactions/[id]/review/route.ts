import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { saveRule, settleWaiting, type RuleFields } from "@/lib/merchantRules";

/**
 * Settles a charge that came in from an SMS and is waiting for review.
 *
 * - Sets its category and note. With `remember`, the merchant + amount becomes a rule, so the next
 *   identical charge lands already filed, and other waiting charges that match are settled the same way.
 *   For a charge in another currency, `amount` corrects the estimate in shekels.
 * - With `ignore`, it is a subscription (or anything else) the user does not want in the list: the charge is
 *   removed. With `remember`, the merchant + amount becomes an ignore rule, so later charges are not added
 *   at all, and other waiting charges that match are removed too.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const body = await req.json().catch(() => null);
  const ignore = body?.ignore === true;
  const category = typeof body?.category === "string" ? body.category.trim().slice(0, 60) : "";
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 200) : "";
  const remember = body?.remember === true;
  // By default the rule is for this exact amount; "any amount" covers every charge from the merchant
  const anyAmount = body?.anyAmount === true;
  if (!ignore && !category) return NextResponse.json({ error: "Missing category" }, { status: 400 });

  let amount: number | null = null;
  if (body?.amount !== undefined && body?.amount !== null && body?.amount !== "") {
    const given = typeof body.amount === "number" ? body.amount : Number(body.amount);
    if (!Number.isFinite(given) || given <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    amount = given;
  }

  const tx = await prisma.transaction.findFirst({ where: { id: params.id, userId: user.id, needsReview: true } });
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // While waiting, the description is the merchant name
  const merchant = tx.description;
  // What a rule compares with: the figure the SMS stated (in the foreign currency, when there is one)
  const ruleAmount = anyAmount ? null : tx.foreignAmount ?? tx.amount;

  if (ignore) {
    await prisma.transaction.delete({ where: { id: tx.id } });
  } else {
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { category, description: note || merchant, needsReview: false, ...(amount !== null ? { amount } : {}) },
    });
  }

  let alsoSettled = 0;
  if (remember) {
    const rule: RuleFields = { merchant, amount: ruleAmount, category: ignore ? "" : category, note: ignore ? "" : note, ignore };
    await saveRule(user.id, rule);
    alsoSettled = await settleWaiting(user.id, rule);
  }

  return NextResponse.json({ success: true, alsoSettled });
}
