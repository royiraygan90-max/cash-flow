import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/welcome", req.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
