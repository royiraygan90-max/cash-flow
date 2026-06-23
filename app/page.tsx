import { prisma } from "@/lib/prisma";
import { computeSalary } from "@/lib/salaryCalc";
import MonthNavigator from "@/app/components/MonthNavigator";
import BalanceHeroCard from "@/app/components/BalanceHeroCard";
import InOutRow from "@/app/components/InOutRow";
import ExpectedSalaryCard from "@/app/components/ExpectedSalaryCard";
import { SixMonthBarChart } from "@/app/components/Charts";
import CategoryBreakdown from "@/app/components/CategoryBreakdown";
import TradingPnlCard from "@/app/components/TradingPnlCard";
import FreelancePnlCard from "@/app/components/FreelancePnlCard";
import TransactionList from "@/app/components/TransactionList";

const HEBREW_MONTHS_SHORT = [
  "ינ","פב","מר","אפ","מי","יו",
  "יל","אג","ספ","אק","נו","דצ",
];

interface PageProps {
  searchParams: { month?: string; year?: string };
}

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: PageProps) {
  const now   = new Date();
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1));
  const year  = parseInt(searchParams.year  ?? String(now.getFullYear()));

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month,     1);

  const currentTransactions = await prisma.transaction.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: "desc" },
  });

  const totalIncome   = currentTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = currentTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const monthShifts       = await prisma.shift.findMany({ where: { date: { gte: start, lt: end } } });
  const regularHours      = monthShifts.reduce((s, sh) => s + sh.regularHours, 0);
  const shabbatHours      = monthShifts.reduce((s, sh) => s + sh.shabbatHours, 0);
  const salary            = computeSalary(regularHours, shabbatHours);
  const salaryTransactions = currentTransactions.filter((t) => t.type === "income" && t.category === "משכורת");
  const salaryPaidAmount   = salaryTransactions.reduce((s, t) => s + t.amount, 0);
  const salaryPaid         = salaryTransactions.length > 0;

  const barData = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date(year, month - 1 - 5 + i, 1);
      const s = new Date(d.getFullYear(), d.getMonth(), 1);
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      return prisma.transaction.findMany({ where: { date: { gte: s, lt: e } } }).then((txs) => ({
        name: HEBREW_MONTHS_SHORT[d.getMonth()],
        income:   txs.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
        expenses: txs.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
      }));
    })
  );

  const tradingExpense    = currentTransactions.filter((t) => t.type === "expense" && t.category === "מסחר").reduce((s, t) => s + t.amount, 0);
  const tradingIncome     = currentTransactions.filter((t) => t.type === "income"  && t.category === "מסחר").reduce((s, t) => s + t.amount, 0);
  const freelanceExpense  = currentTransactions.filter((t) => t.type === "expense" && t.category === "פרילנס").reduce((s, t) => s + t.amount, 0);
  const freelanceIncome   = currentTransactions.filter((t) => t.type === "income"  && t.category === "פרילנס").reduce((s, t) => s + t.amount, 0);

  const expenseByCategory: Record<string, number> = {};
  for (const tx of currentTransactions.filter((t) => t.type === "expense")) {
    expenseByCategory[tx.category] = (expenseByCategory[tx.category] ?? 0) + tx.amount;
  }
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const serializedTransactions = currentTransactions.map((t) => ({
    ...t,
    date:      t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
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
      <MonthNavigator month={month} year={year} />

      <BalanceHeroCard totalIncome={totalIncome} totalExpenses={totalExpenses} />

      <InOutRow totalIncome={totalIncome} totalExpenses={totalExpenses} />

      {((regularHours + shabbatHours) > 0 || salaryPaid) && (
        <ExpectedSalaryCard
          regularHours={regularHours}
          shabbatHours={shabbatHours}
          gross={salary.gross}
          net={salary.net}
          month={month}
          year={year}
          salaryPaid={salaryPaid}
          salaryPaidAmount={salaryPaidAmount}
        />
      )}

      <SixMonthBarChart data={barData} />

      <CategoryBreakdown data={pieData} />

      {(tradingExpense > 0 || tradingIncome > 0) && (
        <TradingPnlCard expense={tradingExpense} income={tradingIncome} />
      )}

      {(freelanceExpense > 0 || freelanceIncome > 0) && (
        <FreelancePnlCard expense={freelanceExpense} income={freelanceIncome} />
      )}

      {/* Recent transactions */}
      <div style={{ marginBottom: 12 }}>
        <TransactionList transactions={serializedTransactions} />
      </div>
    </main>
  );
}
