import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id, date: { gte: start, lt: end } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

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
      userId: user.id,
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
