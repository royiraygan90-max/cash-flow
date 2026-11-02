import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { saveRule, settleWaiting } from "@/lib/merchantRules";

/**
 * Settles a charge that came in from an SMS and is waiting for review: sets its category
 * and note. With `remember`, the merchant + amount becomes a rule, so the next identical
 * charge lands already filed, and other waiting charges that match are settled the same way.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const body = await req.json().catch(() => null);
  const category = typeof body?.category === "string" ? body.category.trim().slice(0, 60) : "";
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 200) : "";
  const remember = body?.remember === true;
  // By default the rule is for this exact amount; "any amount" covers every charge from the merchant
  const anyAmount = body?.anyAmount === true;
  if (!category) return NextResponse.json({ error: "Missing category" }, { status: 400 });

  const tx = await prisma.transaction.findFirst({ where: { id: params.id, userId: user.id, needsReview: true } });
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // While waiting, the description is the merchant name
  const merchant = tx.description;
  const settle = { category, description: note || merchant, needsReview: false };

  await prisma.transaction.update({ where: { id: tx.id }, data: settle });

  let alsoSettled = 0;
  if (remember) {
    const rule = { merchant, amount: anyAmount ? null : tx.amount, category, note };
    await saveRule(user.id, rule);
    alsoSettled = await settleWaiting(user.id, rule);
  }

  return NextResponse.json({ success: true, alsoSettled });
}
