import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function cell(value: string | number | boolean): string {
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET() {
  const [transactions, subscriptions] = await Promise.all([
    prisma.transaction.findMany({ orderBy: { date: "desc" } }),
    prisma.subscription.findMany({ orderBy: { dayOfMonth: "asc" } }),
  ]);

  const rows: string[] = [];

  rows.push("TRANSACTIONS");
  rows.push(['"Date"', '"Description"', '"Amount"', '"Type"', '"Category"'].join(","));

  for (const t of transactions) {
    const d = t.date;
    const day = String(d.getDate()).padStart(2, "0");
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dateStr = `${day}/${mo}/${d.getFullYear()}`;
    const typeHe = t.type === "income" ? "הכנסה" : "הוצאה";
    rows.push([dateStr, t.description, t.amount, typeHe, t.category].map(cell).join(","));
  }

  rows.push("");

  rows.push("SUBSCRIPTIONS");
  rows.push(['"Name"', '"Amount"', '"Day of Month"', '"Category"', '"Active"'].join(","));

  for (const s of subscriptions) {
    rows.push([s.name, s.amount, s.dayOfMonth, s.category, s.isActive ? "כן" : "לא"].map(cell).join(","));
  }

  const csv = rows.join("\r\n");

  const now = new Date();
  const dateTag = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cashflow-backup-${dateTag}.csv"`,
    },
  });
}
