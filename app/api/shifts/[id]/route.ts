import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { splitShiftHours } from "@/lib/shiftCalc";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { date, startTime, endTime } = await req.json();
    const dateObj = new Date(date);
    const split = splitShiftHours(dateObj, startTime, endTime);

    const updated = await prisma.shift.update({
      where: { id: params.id },
      data: {
        date: dateObj,
        startTime,
        endTime,
        hours:        split.totalHours,
        isShabbat:    split.shabbatHours > 0,
        regularHours: split.regularHours,
        shabbatHours: split.shabbatHours,
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
    await prisma.shift.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
