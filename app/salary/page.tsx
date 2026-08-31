import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import { computeSalary, type SalaryProfile } from "@/lib/salaryCalc";
import SalaryMonthNav from "@/app/components/SalaryMonthNav";
import ShiftSummary from "@/app/components/ShiftSummary";
import GrossCard from "@/app/components/GrossCard";
import DeductionsList from "@/app/components/DeductionsList";
import NetCard from "@/app/components/NetCard";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { month?: string; year?: string };
}

export default async function SalaryPage({ searchParams }: PageProps) {
  const user  = await requirePageUser();
  const now   = new Date();
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1));
  const year  = parseInt(searchParams.year  ?? String(now.getFullYear()));

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);

  const [shifts, salarySettings] = await Promise.all([
    prisma.shift.findMany({ where: { userId: user.id, date: { gte: start, lt: end } } }),
    prisma.salarySettings.findUnique({ where: { userId_month_year: { userId: user.id, month, year } } }),
  ]);

  const referralCount = salarySettings?.referralCount ?? 0;
  const regularHours  = shifts.reduce((sum, s) => sum + s.regularHours, 0);
  const shabbatHours  = shifts.reduce((sum, s) => sum + s.shabbatHours, 0);
  const salaryProfile: SalaryProfile = {
    regularRate: user.regularRate,
    shabbatRate: user.shabbatRate,
    overtimeEnabled: user.overtimeEnabled,
    monthlyBonus: user.monthlyBonus,
    travelAllowance: user.travelAllowance,
    otherDeductions: user.otherDeductions,
    studyFundBase: user.studyFundBase,
  };
  const breakdown     = computeSalary(shifts, salaryProfile, referralCount);
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
      <SalaryMonthNav
        month={month}
        year={year}
        profile={salaryProfile}
        currentRegularHours={regularHours}
        currentShabbatHours={shabbatHours}
      />
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
