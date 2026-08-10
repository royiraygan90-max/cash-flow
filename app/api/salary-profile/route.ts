import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const { regularRate, shabbatRate, overtimeEnabled, monthlyBonus, travelAllowance } = await req.json();

  const parsedRegularRate = parseFloat(regularRate);
  const parsedShabbatRate = parseFloat(shabbatRate);
  const parsedMonthlyBonus = parseFloat(monthlyBonus);
  const parsedTravelAllowance = parseFloat(travelAllowance);

  if (
    [parsedRegularRate, parsedShabbatRate, parsedMonthlyBonus, parsedTravelAllowance].some(
      (n) => isNaN(n) || n < 0
    )
  ) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      regularRate: parsedRegularRate,
      shabbatRate: parsedShabbatRate,
      overtimeEnabled: !!overtimeEnabled,
      monthlyBonus: parsedMonthlyBonus,
      travelAllowance: parsedTravelAllowance,
    },
  });

  return NextResponse.json({
    regularRate: updated.regularRate,
    shabbatRate: updated.shabbatRate,
    overtimeEnabled: updated.overtimeEnabled,
    monthlyBonus: updated.monthlyBonus,
    travelAllowance: updated.travelAllowance,
  });
}
