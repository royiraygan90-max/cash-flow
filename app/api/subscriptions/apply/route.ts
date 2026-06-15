import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const today = new Date();
  const todayDay = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);

  const activeSubscriptions = await prisma.subscription.findMany({
    where: { isActive: true, dayOfMonth: todayDay },
  });

  let inserted = 0;

  for (const sub of activeSubscriptions) {
    try {
      const existing = await prisma.transaction.findFirst({
        where: {
          description: sub.name,
          amount: sub.amount,
          date: { gte: monthStart, lt: monthEnd },
        },
      });

      if (!existing) {
        await prisma.transaction.create({
          data: {
            type: "expense",
            description: sub.name,
            amount: sub.amount,
            category: sub.category,
            date: today,
          },
        });
        inserted++;
      }
    } catch (err) {
      console.error(`[apply] Failed to process subscription ${sub.id}:`, err);
    }
  }

  return NextResponse.json({ inserted });
}
