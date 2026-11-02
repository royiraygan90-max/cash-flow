import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { parseRuleFields, settleWaiting } from "@/lib/merchantRules";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const fields = parseRuleFields(await req.json().catch(() => null));
  if (!fields) return NextResponse.json({ error: "Invalid rule" }, { status: 400 });

  const existing = await prisma.merchantRule.findFirst({ where: { id: params.id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Two rules for the same merchant and amount would be ambiguous
  const clash = await prisma.merchantRule.findFirst({
    where: { userId: user.id, merchant: fields.merchant, amount: fields.amount, id: { not: existing.id } },
    select: { id: true },
  });
  if (clash) return NextResponse.json({ error: "Rule already exists" }, { status: 409 });

  const rule = await prisma.merchantRule.update({ where: { id: existing.id }, data: fields });
  const settled = await settleWaiting(user.id, fields);
  return NextResponse.json({ rule, settled });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const existing = await prisma.merchantRule.findFirst({ where: { id: params.id, userId: auth.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.merchantRule.delete({ where: { id: existing.id } });
  return NextResponse.json({ success: true });
}
