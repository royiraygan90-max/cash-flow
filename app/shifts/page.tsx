import { prisma } from "@/lib/prisma";
import ShiftMonthNav from "@/app/components/ShiftMonthNav";
import ShiftSummary from "@/app/components/ShiftSummary";
import ShiftList from "@/app/components/ShiftList";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { month?: string; year?: string };
}

export default async function ShiftsPage({ searchParams }: PageProps) {
  const now   = new Date();
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1));
  const year  = parseInt(searchParams.year  ?? String(now.getFullYear()));

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);

  const shifts = await prisma.shift.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: "asc" },
  });

  const regularHours = shifts.reduce((sum, s) => sum + (s.regularHours ?? 0), 0);
  const shabbatHours = shifts.reduce((sum, s) => sum + (s.shabbatHours ?? 0), 0);

  const serialized = shifts.map((s) => ({
    ...s,
    date:      s.date.toISOString(),
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <main
      className="min-h-screen"
      style={{
        background: "var(--bg-primary)",
        padding: "0 18px 80px",
        maxWidth: 640,
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      <ShiftMonthNav month={month} year={year} />
      <ShiftSummary regularHours={regularHours} shabbatHours={shabbatHours} />
      <ShiftList shifts={serialized} />
    </main>
  );
}
