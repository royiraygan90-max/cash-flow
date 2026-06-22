import { prisma } from "@/lib/prisma";
import { formatMonthLabel, monthKey } from "@/lib/hebrewDates";
import RangeSelect from "@/app/components/RangeSelect";
import StatsViewToggle from "@/app/components/StatsViewToggle";
import AverageExpenseHero from "@/app/components/AverageExpenseHero";
import AverageSavingsIncomeRow from "@/app/components/AverageSavingsIncomeRow";
import CategoryAverageList, { type CategoryStat } from "@/app/components/CategoryAverageList";
import MonthCompareSelector from "@/app/components/MonthCompareSelector";
import MonthCompareSummary from "@/app/components/MonthCompareSummary";
import CategoryCompareList from "@/app/components/CategoryCompareList";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { view?: string; range?: string; monthA?: string; monthB?: string };
}

const pageStyle = {
  background: "var(--bg-primary)",
  padding: "0 18px 80px",
  maxWidth: 640,
  margin: "0 auto",
  direction: "rtl" as const,
};

export default async function StatisticsPage({ searchParams }: PageProps) {
  const view = searchParams.view === "compare" ? "compare" : "stats";
  const rawRange = parseInt(searchParams.range ?? "6");
  const range = [3, 6, 12].includes(rawRange) ? rawRange : 6;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // ── Header (shared) ──────────────────────────────────────────────────────
  const header = (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 16,
          marginBottom: 16,
        }}
      >
        {/* In RTL flex: first child → right (title), second child → left (selector) */}
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "#f2f5f8",
            fontFamily: "Rubik, sans-serif",
          }}
        >
          סטטיסטיקה
        </h1>
        <RangeSelect currentRange={range} currentView={view} />
      </div>
      <StatsViewToggle currentView={view} currentRange={range} />
    </>
  );

  // ── COMPARE VIEW ──────────────────────────────────────────────────────────
  if (view === "compare") {
    const allTxs = await prisma.transaction.findMany({ orderBy: { date: "asc" } });

    const monthSet = new Set<string>();
    for (const tx of allTxs) {
      const d = tx.date;
      monthSet.add(monthKey(d.getFullYear(), d.getMonth() + 1));
    }
    const availableMonths = Array.from(monthSet).sort().reverse();

    const monthA =
      searchParams.monthA && availableMonths.includes(searchParams.monthA)
        ? searchParams.monthA
        : (availableMonths[0] ?? monthKey(currentYear, currentMonth));
    const monthB =
      searchParams.monthB && availableMonths.includes(searchParams.monthB)
        ? searchParams.monthB
        : (availableMonths[1] ?? null);

    if (availableMonths.length < 2 || monthB === null) {
      return (
        <main className="min-h-screen" style={pageStyle}>
          {header}
          <MonthCompareSelector
            monthA={monthA}
            monthB={availableMonths[1] ?? monthA}
            availableMonths={availableMonths}
            currentRange={range}
          />
          <p
            style={{
              textAlign: "center",
              fontSize: 14,
              color: "#6b7785",
              fontFamily: "Rubik, sans-serif",
              marginTop: 32,
              lineHeight: 1.6,
            }}
          >
            צריך נתונים מחודש נוסף בשביל להשוות
          </p>
        </main>
      );
    }

    const [yearA, mA] = monthA.split("-").map(Number);
    const [yearB, mB] = monthB.split("-").map(Number);

    const [txsA, txsB] = await Promise.all([
      prisma.transaction.findMany({
        where: { date: { gte: new Date(yearA, mA - 1, 1), lt: new Date(yearA, mA, 1) } },
      }),
      prisma.transaction.findMany({
        where: { date: { gte: new Date(yearB, mB - 1, 1), lt: new Date(yearB, mB, 1) } },
      }),
    ]);

    const incomeA  = txsA.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenseA = txsA.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const incomeB  = txsB.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenseB = txsB.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

    const totalsA = { income: incomeA, expense: expenseA, net: incomeA - expenseA };
    const totalsB = { income: incomeB, expense: expenseB, net: incomeB - expenseB };

    const catA: Record<string, number> = {};
    const catB: Record<string, number> = {};
    for (const tx of txsA.filter((t) => t.type === "expense")) {
      catA[tx.category] = (catA[tx.category] ?? 0) + tx.amount;
    }
    for (const tx of txsB.filter((t) => t.type === "expense")) {
      catB[tx.category] = (catB[tx.category] ?? 0) + tx.amount;
    }

    return (
      <main className="min-h-screen" style={pageStyle}>
        {header}
        <MonthCompareSelector
          monthA={monthA}
          monthB={monthB}
          availableMonths={availableMonths}
          currentRange={range}
        />
        <MonthCompareSummary totalsA={totalsA} totalsB={totalsB} />
        <CategoryCompareList
          categoriesA={catA}
          categoriesB={catB}
          labelA={formatMonthLabel(yearA, mA)}
          labelB={formatMonthLabel(yearB, mB)}
        />
      </main>
    );
  }

  // ── STATS VIEW ────────────────────────────────────────────────────────────
  const months = Array.from({ length: range }, (_, i) => {
    const d = new Date(currentYear, currentMonth - 1 - (range - 1) + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });

  const monthData = await Promise.all(
    months.map(async ({ year, month }) => {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 1);
      const txs   = await prisma.transaction.findMany({ where: { date: { gte: start, lt: end } } });
      const income  = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { year, month, income, expense, count: txs.length, txs };
    })
  );

  const qualifying = monthData.filter((m) => m.count > 0);
  const hasEnoughData = qualifying.length >= 2;

  const avgExpense = qualifying.length > 0
    ? qualifying.reduce((s, m) => s + m.expense, 0) / qualifying.length
    : 0;
  const avgIncome = qualifying.length > 0
    ? qualifying.reduce((s, m) => s + m.income, 0) / qualifying.length
    : 0;
  const avgSavings = qualifying.length > 0
    ? qualifying.reduce((s, m) => s + (m.income - m.expense), 0) / qualifying.length
    : 0;

  const currentData = monthData.find((m) => m.year === currentYear && m.month === currentMonth);
  const currentMonthExpense = currentData?.expense ?? 0;

  // Per-category averages across qualifying months
  const catStats: Record<string, { total: number; monthCount: number; currentAmount: number }> = {};
  for (const m of qualifying) {
    const sums: Record<string, number> = {};
    for (const tx of m.txs.filter((t) => t.type === "expense")) {
      sums[tx.category] = (sums[tx.category] ?? 0) + tx.amount;
    }
    for (const [cat, amount] of Object.entries(sums)) {
      if (!catStats[cat]) catStats[cat] = { total: 0, monthCount: 0, currentAmount: 0 };
      catStats[cat].total += amount;
      catStats[cat].monthCount += 1;
    }
  }
  // Overlay current-month actuals (even for categories not yet in catStats)
  if (currentData) {
    const currentSums: Record<string, number> = {};
    for (const tx of currentData.txs.filter((t) => t.type === "expense")) {
      currentSums[tx.category] = (currentSums[tx.category] ?? 0) + tx.amount;
    }
    for (const [cat, amount] of Object.entries(currentSums)) {
      if (!catStats[cat]) catStats[cat] = { total: 0, monthCount: 0, currentAmount: 0 };
      catStats[cat].currentAmount = amount;
    }
  }

  const categories: CategoryStat[] = Object.entries(catStats)
    .map(([name, { total, monthCount, currentAmount }]) => {
      const avg = monthCount > 0 ? total / monthCount : 0;
      const pctVsAvg = avg > 0 ? ((currentAmount - avg) / avg) * 100 : null;
      return { name, avg, currentAmount, pctVsAvg };
    })
    .sort((a, b) => b.currentAmount - a.currentAmount || b.avg - a.avg);

  return (
    <main className="min-h-screen" style={pageStyle}>
      {header}

      <AverageExpenseHero
        avgExpense={avgExpense}
        currentMonthExpense={currentMonthExpense}
        hasEnoughData={hasEnoughData}
      />

      <AverageSavingsIncomeRow avgSavings={avgSavings} avgIncome={avgIncome} />

      {!hasEnoughData && (
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#6b7785",
            fontFamily: "Rubik, sans-serif",
            marginBottom: 16,
            padding: "0 8px",
            lineHeight: 1.6,
          }}
        >
          אין עדיין מספיק נתונים להשוואה — תוכל לראות מגמות אחרי שיעברו כמה חודשים.
        </p>
      )}

      <CategoryAverageList categories={categories} hasEnoughData={hasEnoughData} />
    </main>
  );
}
