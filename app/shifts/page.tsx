import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import ShiftMonthNav from "@/app/components/ShiftMonthNav";
import ShiftSummary from "@/app/components/ShiftSummary";
import ShiftList from "@/app/components/ShiftList";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { month?: string; year?: string };
}

export default async function ShiftsPage({ searchParams }: PageProps) {
  const user  = await requirePageUser();
  const now   = new Date();
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1));
  const year  = parseInt(searchParams.year  ?? String(now.getFullYear()));

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);

  const [shifts, salarySettings] = await Promise.all([
    prisma.shift.findMany({
      where: { userId: user.id, date: { gte: start, lt: end } },
      orderBy: { date: "asc" },
    }),
    prisma.salarySettings.findUnique({ where: { userId_month_year: { userId: user.id, month, year } } }),
  ]);

  const regularHours = shifts.reduce((sum, s) => sum + s.regularHours, 0);
  const shabbatHours = shifts.reduce((sum, s) => sum + s.shabbatHours, 0);
  const referralCount = salarySettings?.referralCount ?? 0;

  const salaryProfile = {
    regularRate: user.regularRate,
    shabbatRate: user.shabbatRate,
    overtimeEnabled: user.overtimeEnabled,
    monthlyBonus: user.monthlyBonus,
    travelAllowance: user.travelAllowance,
  };

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
      <ShiftMonthNav month={month} year={year} profile={salaryProfile} shifts={serialized} referralCount={referralCount} />
      <ShiftSummary regularHours={regularHours} shabbatHours={shabbatHours} />
      <ShiftList shifts={serialized} profile={salaryProfile} referralCount={referralCount} />
    </main>
  );
}
