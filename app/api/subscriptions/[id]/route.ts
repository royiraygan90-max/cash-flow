import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { name, amount, dayOfMonth, category, isActive } = body;

  try {
    const updated = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(dayOfMonth !== undefined && { dayOfMonth: parseInt(dayOfMonth) }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
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
  try {
    await prisma.subscription.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
