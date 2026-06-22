import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { splitShiftHours } from "@/lib/shiftCalc";

export async function POST() {
  const shifts = await prisma.shift.findMany({ orderBy: { date: "asc" } });

  const log: object[] = [];

  for (const shift of shifts) {
    const split = splitShiftHours(shift.date, shift.startTime, shift.endTime);

    log.push({
      id:              shift.id,
      date:            shift.date.toISOString().split("T")[0],
      startTime:       shift.startTime,
      endTime:         shift.endTime,
      old_hours:       shift.hours,
      old_isShabbat:   shift.isShabbat,
      new_totalHours:  split.totalHours,
      new_regularHours: split.regularHours,
      new_shabbatHours: split.shabbatHours,
    });

    await prisma.shift.update({
      where: { id: shift.id },
      data: {
        hours:        split.totalHours,
        isShabbat:    split.shabbatHours > 0,
        regularHours: split.regularHours,
        shabbatHours: split.shabbatHours,
      },
    });
  }

  return NextResponse.json({ total: shifts.length, log });
}
