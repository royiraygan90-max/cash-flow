import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

/**
 * Marks charges that a rule filed on its own as seen, so the dashboard stops listing them.
 * Only the ids the person was shown are cleared: a charge that arrived while the card was
 * open stays until it has been shown.
 */
export async function POST(req: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown): id is string => typeof id === "string") : [];
  if (ids.length === 0 || ids.length > 500) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const result = await prisma.transaction.updateMany({
    where: { id: { in: ids }, userId: auth.user.id, unseen: true },
    data: { unseen: false },
  });
  return NextResponse.json({ cleared: result.count });
}
