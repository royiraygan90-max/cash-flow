import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, type, category, description, amount } = body;

  if (!date || !type || !category || !amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      date: new Date(date),
      type,
      category,
      description: description ?? "",
      amount: parseFloat(amount),
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
