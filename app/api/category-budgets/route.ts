import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const { budgets } = await req.json();
  if (!budgets || typeof budgets !== "object") {
    return NextResponse.json({ error: "Invalid budgets" }, { status: 400 });
  }

  await prisma.$transaction(
    Object.entries(budgets as Record<string, unknown>).map(([category, amountRaw]) => {
      const amount = parseFloat(String(amountRaw));
      if (!isFinite(amount) || amount <= 0) {
        return prisma.categoryBudget.deleteMany({ where: { userId: user.id, category } });
      }
      return prisma.categoryBudget.upsert({
        where:  { userId_category: { userId: user.id, category } },
        create: { userId: user.id, category, amount },
        update: { amount },
      });
    })
  );

  const rows = await prisma.categoryBudget.findMany({ where: { userId: user.id } });
  return NextResponse.json({ budgets: Object.fromEntries(rows.map((r) => [r.category, r.amount])) });
}
