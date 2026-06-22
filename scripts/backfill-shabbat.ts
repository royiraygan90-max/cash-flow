import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function isShabbatShift(date: Date, startTime: string): boolean {
  const day = date.getDay(); // 0=Sunday … 6=Saturday
  const hour = parseInt(startTime.split(":")[0], 10);
  return (day === 5 && hour >= 19) || day === 6 || (day === 0 && hour < 4);
}

async function main() {
  const shifts = await prisma.shift.findMany();
  console.log(`Found ${shifts.length} total shifts.`);

  let corrected = 0;

  for (const shift of shifts) {
    const correct = isShabbatShift(shift.date, shift.startTime);
    if (correct !== shift.isShabbat) {
      await prisma.shift.update({
        where: { id: shift.id },
        data: { isShabbat: correct },
      });
      console.log(
        `  Fixed ${shift.id}: date=${shift.date.toISOString().split("T")[0]} start=${shift.startTime} — isShabbat ${shift.isShabbat} → ${correct}`
      );
      corrected++;
    }
  }

  console.log(`Done. ${corrected} record(s) corrected.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
