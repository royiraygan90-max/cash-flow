import { prisma } from "@/lib/prisma";
import { requirePageUser } from "@/lib/auth";
import RulesManager from "@/app/components/RulesManager";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const user = await requirePageUser();
  const rules = await prisma.merchantRule.findMany({
    where: { userId: user.id },
    orderBy: [{ merchant: "asc" }, { amount: "asc" }],
  });

  return (
    <main
      className="min-h-screen"
      style={{
        background: "var(--bg-primary)",
        padding: "0 18px 100px",
        maxWidth: 640,
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      <RulesManager rules={rules.map((r) => ({ id: r.id, merchant: r.merchant, amount: r.amount, category: r.category, note: r.note }))} />
    </main>
  );
}
