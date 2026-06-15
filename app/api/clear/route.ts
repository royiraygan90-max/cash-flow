import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE() {
  const result = await prisma.transaction.deleteMany({});
  return NextResponse.json({ deleted: result.count });
}
