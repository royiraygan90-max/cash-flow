import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? "0");
  const year  = parseInt(searchParams.get("year")  ?? "0");

  const settings = await prisma.salarySettings.findUnique({
    where: { userId_month_year: { userId: user.id, month, year } },
  });

  return NextResponse.json({ referralCount: settings?.referralCount ?? 0 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const { month, year, referralCount } = await req.json();

  const settings = await prisma.salarySettings.upsert({
    where:  { userId_month_year: { userId: user.id, month, year } },
    create: { month, year, referralCount, userId: user.id },
    update: { referralCount },
  });

  return NextResponse.json({ referralCount: settings.referralCount });
}
