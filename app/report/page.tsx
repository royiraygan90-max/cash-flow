import { prisma } from "@/lib/prisma";
import { HEBREW_MONTHS_FULL } from "@/lib/hebrewDates";
import YearNavigator from "@/app/components/YearNavigator";
import YearlyBalanceChart from "@/app/components/YearlyBalanceChart";
import InOutRow from "@/app/components/InOutRow";
import YearStatsGrid from "@/app/components/YearStatsGrid";
import YearCompareCard from "@/app/components/YearCompareCard";
import IncomeBySourceCard from "@/app/components/IncomeBySourceCard";
import CategoryBreakdown from "@/app/components/CategoryBreakdown";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { year?: string };
}

export default async function ReportPage({ searchParams }: PageProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const year = parseInt(searchParams.year ?? String(currentYear), 10) || currentYear;

  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  const yearTxs = await prisma.transaction.findMany({
    where: { date: { gte: yearStart, lt: yearEnd } },
    orderBy: { date: "asc" },
  });

  const lastMonthIdx = year === currentYear ? now.getMonth() : 11;

  const monthly: { monthIdx: number; income: number; expenses: number; net: number }[] = [];
  for (let m = 0; m <= lastMonthIdx; m++) {
    const txs = yearTxs.filter((t) => t.date.getMonth() === m);
    const incomeRaw = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expensesRaw = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const freelanceExp = txs.filter((t) => t.type === "expense" && t.category === "פרילנס").reduce((s, t) => s + t.amount, 0);
    const income = incomeRaw - freelanceExp;
    const expenses = expensesRaw - freelanceExp;
    monthly.push({ monthIdx: m, income, expenses, net: income - expenses });
  }

  let running = 0;
  const cumulative = monthly.map((m) => { running += m.net; return { ...m, cumulative: running }; });

  const totalIncome = monthly.reduce((s, m) => s + m.income, 0);
  const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0);
  const totalNet = totalIncome - totalExpenses;

  const sortedByNet = [...cumulative].sort((a, b) => b.net - a.net);
  const bestMonth = sortedByNet[0];
  const worstMonth = sortedByNet[sortedByNet.length - 1];
  const avgMonthlyNet = cumulative.length > 0 ? totalNet / cumulative.length : 0;
  const savingsRate = totalIncome > 0 ? (totalNet / totalIncome) * 100 : 0;

  const salaryIncome = yearTxs.filter((t) => t.type === "income" && t.category === "משכורת").reduce((s, t) => s + t.amount, 0);
  const freelanceIncomeRaw = yearTxs.filter((t) => t.type === "income" && t.category === "פרילנס").reduce((s, t) => s + t.amount, 0);
  const freelanceExpenseRaw = yearTxs.filter((t) => t.type === "expense" && t.category === "פרילנס").reduce((s, t) => s + t.amount, 0);
  const tradingIncomeRaw = yearTxs.filter((t) => t.type === "income" && t.category === "מסחר").reduce((s, t) => s + t.amount, 0);
  const tradingExpenseRaw = yearTxs.filter((t) => t.type === "expense" && t.category === "מסחר").reduce((s, t) => s + t.amount, 0);
  const otherIncome = yearTxs.filter((t) => t.type === "income" && !["משכורת", "פרילנס", "מסחר"].includes(t.category)).reduce((s, t) => s + t.amount, 0);

  const incomeSources = [
    { name: "משכורת", value: salaryIncome },
    { name: "פרילנס", value: freelanceIncomeRaw - freelanceExpenseRaw },
    { name: "מסחר", value: tradingIncomeRaw - tradingExpenseRaw },
    ...(otherIncome > 0 ? [{ name: "אחר", value: otherIncome }] : []),
  ].filter((s) => s.value !== 0);

  const expenseByCategory: Record<string, number> = {};
  for (const tx of yearTxs.filter((t) => t.type === "expense" && t.category !== "פרילנס")) {
    expenseByCategory[tx.category] = (expenseByCategory[tx.category] ?? 0) + tx.amount;
  }
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const prevYearStart = new Date(year - 1, 0, 1);
  const prevYearEnd = new Date(year, 0, 1);
  const prevYearTxs = await prisma.transaction.findMany({ where: { date: { gte: prevYearStart, lt: prevYearEnd } } });
  const hasPrevYearData = prevYearTxs.length > 0;
  const prevIncomeRaw = prevYearTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const prevExpensesRaw = prevYearTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const prevFreelanceExp = prevYearTxs.filter((t) => t.type === "expense" && t.category === "פרילנס").reduce((s, t) => s + t.amount, 0);
  const prevIncome = prevIncomeRaw - prevFreelanceExp;
  const prevExpenses = prevExpensesRaw - prevFreelanceExp;

  return (
    <main
      style={{
        background: "var(--bg-primary)",
        minHeight: "100vh",
        padding: "0 18px 80px",
        maxWidth: 640,
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      <div style={{ marginTop: 20, marginBottom: 4, textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
          דוח שנתי
        </h1>
      </div>

      <YearNavigator year={year} />

      {cumulative.length === 0 ? (
        <p style={{ textAlign: "center", fontSize: 14, color: "#6b7785", fontFamily: "Rubik, sans-serif", marginTop: 32 }}>
          אין עדיין נתונים לשנה זו
        </p>
      ) : (
        <>
          <div style={{ background: "linear-gradient(155deg, #171d26, #10151c)", border: "1px solid #20272f", borderRadius: 28, padding: 24, textAlign: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: "#7c8896", marginBottom: 8, fontFamily: "Rubik, sans-serif" }}>
              יתרה שצברת ב-{year}
            </p>
            <p
              dir="ltr"
              style={{ fontSize: 46, fontWeight: 600, color: totalNet >= 0 ? "#34e0a1" : "#ff6b6b", lineHeight: 1, fontFamily: "Rubik, sans-serif", display: "inline-block" }}
            >
              {totalNet < 0 ? "−" : ""}₪{Math.round(Math.abs(totalNet)).toLocaleString("he-IL")}
            </p>
          </div>

          <YearlyBalanceChart data={cumulative} />
          <InOutRow totalIncome={totalIncome} totalExpenses={totalExpenses} />
          <YearStatsGrid
            bestMonthLabel={HEBREW_MONTHS_FULL[bestMonth.monthIdx]}
            bestMonthNet={bestMonth.net}
            worstMonthLabel={HEBREW_MONTHS_FULL[worstMonth.monthIdx]}
            worstMonthNet={worstMonth.net}
            avgMonthlyNet={avgMonthlyNet}
            savingsRate={savingsRate}
          />
          <YearCompareCard
            hasPrevYearData={hasPrevYearData}
            prevYear={year - 1}
            rows={[
              { label: "הכנסות", current: totalIncome, previous: prevIncome },
              { label: "הוצאות", current: totalExpenses, previous: prevExpenses },
              { label: "מאזן", current: totalNet, previous: prevIncome - prevExpenses },
            ]}
          />
          <IncomeBySourceCard sources={incomeSources} />
          <CategoryBreakdown data={pieData} />
        </>
      )}
    </main>
  );
}
