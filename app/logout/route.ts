import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, getRequestOrigin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/welcome", getRequestOrigin(req)));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
