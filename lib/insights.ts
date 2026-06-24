import { prisma } from "@/lib/prisma";
import { HEBREW_MONTHS_FULL } from "@/lib/hebrewDates";
import { isSubscriptionInRange } from "@/lib/subscriptionRange";

export type Insight = {
  id: string;
  variant: "positive" | "warning" | "info";
  icon: string;
  label?: string;
  title: string;
  text: string;
};

export async function computeInsights(): Promise<Insight[]> {
  const insights: Insight[] = [];

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed
  const daysElapsed = now.getDate();
  const daysInMonth = new Date(year, month, 0).getDate();

  const firstOfMonth = new Date(year, month - 1, 1);
  const firstOfNextMonth = new Date(year, month, 1);

  // ── a) PACE PROJECTION ────────────────────────────────────────────────────
  const currentTxs = await prisma.transaction.findMany({
    where: { date: { gte: firstOfMonth, lt: firstOfNextMonth } },
  });

  if (currentTxs.length > 0) {
    const income = currentTxs
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = currentTxs
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    const currentNet = income - expense;
    const projectedNet = Math.round((currentNet / daysElapsed) * daysInMonth);
    const monthName = HEBREW_MONTHS_FULL[month - 1];

    if (projectedNet >= 0) {
      insights.push({
        id: "pace-positive",
        variant: "positive",
        icon: "trending_up",
        title: "בדרך לחודש חיובי",
        text: `בקצב הנוכחי תסיים את ${monthName} ב-+${projectedNet.toLocaleString("he-IL")} ₪`,
      });
    } else {
      insights.push({
        id: "pace-warning",
        variant: "warning",
        icon: "trending_down",
        title: "בדרך לחודש שלילי",
        text: `בקצב הנוכחי תסיים את ${monthName} ב-−${Math.abs(projectedNet).toLocaleString("he-IL")} ₪`,
      });
    }
  }

  // ── Shared prior-month data for b) and e) ─────────────────────────────────
  const priorTxs = await prisma.transaction.findMany({
    where: { date: { lt: firstOfMonth } },
  });

  // Group prior expenses by "year-monthIndex" key, then by category
  const priorByMonthCat: Record<string, Record<string, number>> = {};
  for (const tx of priorTxs.filter((t) => t.type === "expense")) {
    const d = tx.date;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!priorByMonthCat[key]) priorByMonthCat[key] = {};
    priorByMonthCat[key][tx.category] =
      (priorByMonthCat[key][tx.category] ?? 0) + tx.amount;
  }

  // Per-category avg across qualifying months (only months where that category appeared)
  const catPriorTotal: Record<string, number> = {};
  const catPriorMonths: Record<string, number> = {};
  for (const monthlyCats of Object.values(priorByMonthCat)) {
    for (const [cat, amount] of Object.entries(monthlyCats)) {
      catPriorTotal[cat] = (catPriorTotal[cat] ?? 0) + amount;
      catPriorMonths[cat] = (catPriorMonths[cat] ?? 0) + 1;
    }
  }
  const catPriorAvg: Record<string, number> = {};
  for (const cat of Object.keys(catPriorTotal)) {
    catPriorAvg[cat] = catPriorTotal[cat] / catPriorMonths[cat];
  }

  // Current month expense by category
  const currentExpByCat: Record<string, number> = {};
  for (const tx of currentTxs.filter((t) => t.type === "expense")) {
    currentExpByCat[tx.category] =
      (currentExpByCat[tx.category] ?? 0) + tx.amount;
  }

  // ── b) CATEGORY OVERSPEND WARNINGS ───────────────────────────────────────
  type CatEntry = { cat: string; pct: number; currentAmount: number };

  const overspendEntries: CatEntry[] = [];
  for (const [cat, avgPrior] of Object.entries(catPriorAvg)) {
    const currentAmount = currentExpByCat[cat] ?? 0;
    if (currentAmount >= avgPrior * 1.15) {
      const pct = Math.round(((currentAmount - avgPrior) / avgPrior) * 100);
      overspendEntries.push({ cat, pct, currentAmount });
    }
  }
  overspendEntries.sort((a, b) => b.pct - a.pct);
  for (const { cat, pct, currentAmount } of overspendEntries.slice(0, 2)) {
    insights.push({
      id: `overspend-${cat}`,
      variant: "warning",
      icon: "warning",
      label: "החודש",
      title: `חריגה בקטגוריית ${cat}`,
      text: `הוצאת ${Math.round(currentAmount).toLocaleString("he-IL")} ₪ — מעל הממוצע החודשי שלך ב-${pct}%`,
    });
  }

  // ── c) UPCOMING SUBSCRIPTION CHARGES ─────────────────────────────────────
  const activeSubs = await prisma.subscription.findMany({
    where: { isActive: true },
  });

  const todayMidnight = new Date(year, now.getMonth(), now.getDate());

  type SubEntry = {
    daysUntil: number;
    name: string;
    amount: number;
    clampedDay: number;
    targetMonthIdx: number;
  };
  const subEntries: SubEntry[] = [];

  for (const sub of activeSubs) {
    const currentMonthIdx = now.getMonth(); // 0-indexed
    const currentYear = now.getFullYear();

    let targetYear: number;
    let targetMonthIdx: number;

    if (now.getDate() <= sub.dayOfMonth) {
      targetYear = currentYear;
      targetMonthIdx = currentMonthIdx;
    } else {
      targetYear = currentMonthIdx === 11 ? currentYear + 1 : currentYear;
      targetMonthIdx = currentMonthIdx === 11 ? 0 : currentMonthIdx + 1;
    }

    if (!isSubscriptionInRange(sub, targetYear, targetMonthIdx)) continue;

    const daysInTargetMonth = new Date(targetYear, targetMonthIdx + 1, 0).getDate();
    const clampedDay = Math.min(sub.dayOfMonth, daysInTargetMonth);
    const billingDate = new Date(targetYear, targetMonthIdx, clampedDay);
    const daysUntil = Math.round(
      (billingDate.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil >= 0 && daysUntil <= 7) {
      subEntries.push({ daysUntil, name: sub.name, amount: sub.amount, clampedDay, targetMonthIdx });
    }
  }

  subEntries.sort((a, b) => a.daysUntil - b.daysUntil);
  for (const { daysUntil, name, amount, clampedDay, targetMonthIdx } of subEntries.slice(0, 2)) {
    const label =
      daysUntil === 0 ? "היום" :
      daysUntil === 1 ? "מחר" :
      `בעוד ${daysUntil} ימים`;
    const monthName = HEBREW_MONTHS_FULL[targetMonthIdx];
    insights.push({
      id: `sub-${name}`,
      variant: "info",
      icon: "notifications",
      label,
      title: "חיוב מנוי מתקרב",
      text: `${name} יחויב ב-${clampedDay} ב${monthName} — ₪${Math.round(amount).toLocaleString("he-IL")}`,
    });
  }

  // ── d) SUBSCRIPTIONS YEARLY SUMMARY ───────────────────────────────────────
  const activeSubsNow = activeSubs.filter((sub) =>
    isSubscriptionInRange(sub, year, month - 1) // month is 1-indexed
  );

  if (activeSubsNow.length > 0) {
    const yearlyTotal = Math.round(
      activeSubsNow.reduce((s, sub) => s + sub.amount, 0) * 12
    );
    const largest = activeSubsNow.reduce(
      (max, sub) => (sub.amount > max.amount ? sub : max),
      activeSubsNow[0]
    );
    insights.push({
      id: "subs-yearly",
      variant: "info",
      icon: "savings",
      title: `המנויים שלך מסתכמים ל-${yearlyTotal.toLocaleString("he-IL")} ₪ בשנה`,
      text: `הכי גדול: ${largest.name} (₪${Math.round(largest.amount).toLocaleString("he-IL")}/חודש). שווה לבדוק אם הכל בשימוש.`,
    });
  }

  // ── e) CATEGORY UNDERSPEND PRAISE ─────────────────────────────────────────
  const underspendEntries: CatEntry[] = [];
  for (const [cat, avgPrior] of Object.entries(catPriorAvg)) {
    if (avgPrior <= 0) continue;
    const currentAmount = currentExpByCat[cat] ?? 0;
    if (currentAmount > 0 && currentAmount <= avgPrior * 0.8) {
      const pct = Math.round(((avgPrior - currentAmount) / avgPrior) * 100);
      underspendEntries.push({ cat, pct, currentAmount });
    }
  }
  underspendEntries.sort((a, b) => b.pct - a.pct);
  for (const { cat, pct } of underspendEntries.slice(0, 2)) {
    insights.push({
      id: `underspend-${cat}`,
      variant: "positive",
      icon: "check_circle",
      label: "החודש",
      title: `חיסכון יפה בקטגוריית '${cat}'`,
      text: `החודש הוצאת ${pct}% מתחת לממוצע. כל הכבוד!`,
    });
  }

  return insights;
}
