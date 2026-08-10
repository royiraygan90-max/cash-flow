import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const body = await req.json();
  const { name, amount, dayOfMonth, category, isActive, startMonth, endMonth } = body;

  if (amount !== undefined && isNaN(parseFloat(amount))) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (dayOfMonth !== undefined && isNaN(parseInt(dayOfMonth, 10))) {
    return NextResponse.json({ error: "Invalid dayOfMonth" }, { status: 400 });
  }

  try {
    const existing = await prisma.subscription.findFirst({ where: { id: params.id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(dayOfMonth !== undefined && { dayOfMonth: parseInt(dayOfMonth, 10) }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(startMonth !== undefined && { startMonth: startMonth ? new Date(startMonth) : null }),
        ...(endMonth !== undefined && { endMonth: endMonth ? new Date(endMonth) : null }),
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  try {
    const existing = await prisma.subscription.findFirst({ where: { id: params.id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.subscription.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
