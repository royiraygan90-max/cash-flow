import { prisma } from "@/lib/prisma";
import MonthNavigator from "@/app/components/MonthNavigator";
import BalanceHeroCard from "@/app/components/BalanceHeroCard";
import InOutRow from "@/app/components/InOutRow";
import { SixMonthBarChart } from "@/app/components/Charts";
import CategoryBreakdown from "@/app/components/CategoryBreakdown";
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

      <SixMonthBarChart data={barData} />

      <CategoryBreakdown data={pieData} />

      {/* Recent transactions */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            direction: "rtl",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
            עסקאות אחרונות
          </span>
          <a href="#" style={{ fontSize: 12, color: "#34e0a1", fontFamily: "Rubik, sans-serif", textDecoration: "none" }}>
            הצג הכל
          </a>
        </div>
        <TransactionList transactions={serializedTransactions} limit={5} />
      </div>
    </main>
  );
}
