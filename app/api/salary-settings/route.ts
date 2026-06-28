import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") ?? "0");
  const year  = parseInt(searchParams.get("year")  ?? "0");

  const settings = await prisma.salarySettings.findUnique({
    where: { month_year: { month, year } },
  });

  return NextResponse.json({ referralCount: settings?.referralCount ?? 0 });
}

export async function PUT(req: NextRequest) {
  const { month, year, referralCount } = await req.json();

  const settings = await prisma.salarySettings.upsert({
    where:  { month_year: { month, year } },
    create: { month, year, referralCount },
    update: { referralCount },
  });

  return NextResponse.json({ referralCount: settings.referralCount });
}
