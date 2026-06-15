import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { dayOfMonth: "asc" },
  });
  return NextResponse.json(subscriptions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, amount, dayOfMonth, category } = body;

  if (!name || !amount || !dayOfMonth) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const subscription = await prisma.subscription.create({
    data: {
      name,
      amount: parseFloat(amount),
      dayOfMonth: parseInt(dayOfMonth),
      category: category ?? "מנוי",
    },
  });

  return NextResponse.json(subscription, { status: 201 });
}
