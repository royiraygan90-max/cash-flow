import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: { dayOfMonth: "asc" },
  });
  return NextResponse.json(subscriptions);
}

export async function POST(req: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const body = await req.json();
  const { name, amount, dayOfMonth, category, startMonth, endMonth } = body;

  if (!name || amount == null || !dayOfMonth) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const subscription = await prisma.subscription.create({
    data: {
      name,
      amount: parseFloat(amount),
      dayOfMonth: parseInt(dayOfMonth, 10),
      category: category ?? "מנוי",
      startMonth: startMonth ? new Date(startMonth) : null,
      endMonth: endMonth ? new Date(endMonth) : null,
      userId: user.id,
    },
  });

  return NextResponse.json(subscription, { status: 201 });
}
