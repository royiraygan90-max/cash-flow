import { PrismaClient } from "@prisma/client";
import { splitShiftHours } from "../lib/shiftCalc";

const prisma = new PrismaClient();

async function main() {
  const shifts = await prisma.shift.findMany({ orderBy: { date: "asc" } });
  console.log(`Found ${shifts.length} shifts.\n`);
  console.log(
    ["date", "start", "end", "old_hours", "old_isShabbat", "new_total", "new_regular", "new_shabbat"]
      .join("\t")
  );

  for (const shift of shifts) {
    const split = splitShiftHours(shift.date, shift.startTime, shift.endTime);
    console.log(
      [
        shift.date.toISOString().split("T")[0],
        shift.startTime,
        shift.endTime,
        shift.hours.toFixed(2),
        shift.isShabbat,
        split.totalHours.toFixed(2),
        split.regularHours.toFixed(2),
        split.shabbatHours.toFixed(2),
      ].join("\t")
    );
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

  console.log(`\nDone. ${shifts.length} record(s) updated.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
