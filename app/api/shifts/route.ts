import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { splitShiftHours } from "@/lib/shiftCalc";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
  const year  = parseInt(searchParams.get("year")  ?? String(new Date().getFullYear()));

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);

  const shifts = await prisma.shift.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(shifts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, startTime, endTime } = body;

  if (!date || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const dateObj = new Date(date);
  const split = splitShiftHours(dateObj, startTime, endTime);

  const shift = await prisma.shift.create({
    data: {
      date: dateObj,
      startTime,
      endTime,
      hours:        split.totalHours,
      regularHours: split.regularHours,
      shabbatHours: split.shabbatHours,
    },
  });

  return NextResponse.json(shift, { status: 201 });
}
