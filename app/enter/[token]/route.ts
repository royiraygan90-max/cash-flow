import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, getRequestOrigin } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const user = await prisma.user.findUnique({ where: { token: params.token } });
  const origin = getRequestOrigin(req);

  if (!user) {
    return NextResponse.redirect(new URL("/welcome?e=invalid", origin));
  }

  const res = NextResponse.redirect(new URL("/", origin));
  res.cookies.set(SESSION_COOKIE, user.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 5,
  });
  return res;
}
