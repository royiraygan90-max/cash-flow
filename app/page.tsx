import { prisma } from "@/lib/prisma";
import MonthNavigator from "@/app/components/MonthNavigator";
import KPIStrip from "@/app/components/KPIStrip";
import { SixMonthBarChart, ExpenseDonutChart } from "@/app/components/Charts";
import TransactionList from "@/app/components/TransactionList";
import FloatingAddButton from "@/app/components/FloatingAddButton";

const HEBREW_MONTHS_SHORT = [
  "ינ", "פב", "מר", "אפ", "מי", "יו",
  "יל", "אג", "ספ", "אק", "נו", "דצ",
];

interface PageProps {
  searchParams: { month?: string; year?: string };
}

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: PageProps) {
  const now = new Date();
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1));
  const year = parseInt(searchParams.year ?? String(now.getFullYear()));

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const currentTransactions = await prisma.transaction.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: "desc" },
  });

  const totalIncome = currentTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpenses = currentTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const barData = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date(year, month - 1 - 5 + i, 1);
      const s = new Date(d.getFullYear(), d.getMonth(), 1);
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      return prisma.transaction.findMany({ where: { date: { gte: s, lt: e } } }).then((txs) => ({
        name: HEBREW_MONTHS_SHORT[d.getMonth()],
        income: txs.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
        expenses: txs.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
      }));
    })
  );

  const expenseByCategory: Record<string, number> = {};
  for (const tx of currentTransactions.filter((t) => t.type === "expense")) {
    expenseByCategory[tx.category] = (expenseByCategory[tx.category] ?? 0) + tx.amount;
  }
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const serializedTransactions = currentTransactions.map((t) => ({
    ...t,
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-4 md:px-12 md:py-0 pb-24 max-w-[1400px] mx-auto">
      <MonthNavigator month={month} year={year} />

      <KPIStrip totalIncome={totalIncome} totalExpenses={totalExpenses} />

      <div className="flex flex-col md:grid md:grid-cols-[55fr_45fr] gap-4 mb-6">
        <SixMonthBarChart data={barData} />
        <ExpenseDonutChart data={pieData} />
      </div>

      <TransactionList transactions={serializedTransactions} />

      <FloatingAddButton />
    </main>
  );
}
