import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isShabbatCorrect(date: Date, startTime: string): boolean {
  const day = date.getDay();
  const hour = parseInt(startTime.split(":")[0], 10);
  return (day === 5 && hour >= 19) || day === 6 || (day === 0 && hour < 4);
}

export async function POST() {
  const shifts = await prisma.shift.findMany();
  const corrections: string[] = [];

  for (const shift of shifts) {
    const correct = isShabbatCorrect(shift.date, shift.startTime);
    if (correct !== shift.isShabbat) {
      await prisma.shift.update({ where: { id: shift.id }, data: { isShabbat: correct } });
      corrections.push(
        `${shift.date.toISOString().split("T")[0]} ${shift.startTime}: ${shift.isShabbat} → ${correct}`
      );
    }
  }

  return NextResponse.json({
    total: shifts.length,
    corrected: corrections.length,
    corrections,
  });
}
