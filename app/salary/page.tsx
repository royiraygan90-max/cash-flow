import { prisma } from "@/lib/prisma";
import { computeSalary } from "@/lib/salaryCalc";
import SalaryMonthNav from "@/app/components/SalaryMonthNav";
import ShiftSummary from "@/app/components/ShiftSummary";
import GrossCard from "@/app/components/GrossCard";
import DeductionsList from "@/app/components/DeductionsList";
import NetCard from "@/app/components/NetCard";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { month?: string; year?: string; referrals?: string };
}

export default async function SalaryPage({ searchParams }: PageProps) {
  const now           = new Date();
  const month         = parseInt(searchParams.month    ?? String(now.getMonth() + 1));
  const year          = parseInt(searchParams.year     ?? String(now.getFullYear()));
  const referralCount = parseInt(searchParams.referrals ?? "0") || 0;

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);

  const shifts = await prisma.shift.findMany({
    where: { date: { gte: start, lt: end } },
  });

  const regularHours = shifts.reduce((sum, s) => sum + s.regularHours, 0);
  const shabbatHours = shifts.reduce((sum, s) => sum + s.shabbatHours, 0);
  const breakdown    = computeSalary(regularHours, shabbatHours, referralCount);
  const noShifts     = regularHours + shabbatHours === 0;

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
      <SalaryMonthNav month={month} year={year} />
      <ShiftSummary regularHours={regularHours} shabbatHours={shabbatHours} />
      {noShifts && (
        <p
          style={{
            fontSize: 12,
            color: "#6b7785",
            textAlign: "center",
            marginBottom: 12,
            fontFamily: "Rubik, sans-serif",
          }}
        >
          לא הוזנו משמרות החודש — השכר מבוסס רק על בונוס ונסיעות.
        </p>
      )}
      <GrossCard breakdown={breakdown} shabbatHours={shabbatHours} referralCount={referralCount} month={month} year={year} />
      <DeductionsList breakdown={breakdown} />
      <NetCard net={breakdown.net} />
    </main>
  );
}
