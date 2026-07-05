import { PrismaClient } from "@prisma/client";
import { splitShiftHours } from "../lib/shiftCalc";

const prisma = new PrismaClient();

async function main() {
  const shifts = await prisma.shift.findMany({ orderBy: { date: "asc" } });
  console.log(`Found ${shifts.length} shifts.\n`);
  console.log(
    ["date", "start", "end", "old_regular", "old_shabbat", "new_regular", "new_shabbat"].join("\t")
  );

  let changed = 0;
  for (const shift of shifts) {
    const split = splitShiftHours(shift.date, shift.startTime, shift.endTime);
    const isChanged =
      Math.abs(split.regularHours - shift.regularHours) > 1e-9 ||
      Math.abs(split.shabbatHours - shift.shabbatHours) > 1e-9;
    if (isChanged) changed++;

    console.log(
      [
        shift.date.toISOString().split("T")[0],
        shift.startTime,
        shift.endTime,
        shift.regularHours.toFixed(2),
        shift.shabbatHours.toFixed(2),
        split.regularHours.toFixed(2),
        split.shabbatHours.toFixed(2),
      ].join("\t")
    );

    await prisma.shift.update({
      where: { id: shift.id },
      data: {
        hours:        split.totalHours,
        regularHours: split.regularHours,
        shabbatHours: split.shabbatHours,
      },
    });
  }

  console.log(`\nDone. ${shifts.length} record(s) checked, ${changed} corrected.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
