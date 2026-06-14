import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: start, lt: end } },
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return NextResponse.json({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
  });
}
