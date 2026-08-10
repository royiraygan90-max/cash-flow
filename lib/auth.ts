import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "cf_session";

/**
 * Route Handlers' `req.url` reflects the internal address Next.js's server
 * sees, not the public host — behind Railway's reverse proxy that's the
 * container's own port, so `new URL(path, req.url)` redirects to
 * localhost instead of the real domain. Prefer the standard forwarded
 * headers the proxy sets for the original public request.
 */
export function getRequestOrigin(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
  return `${proto}://${host}`;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return prisma.user.findUnique({ where: { token } });
}

/** For Server Component pages: redirects to /welcome when there's no session. */
export async function requirePageUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/welcome");
  return user;
}

/** For Route Handlers: returns a 401 response to send back when there's no session. */
export async function requireApiUser(): Promise<{ user: User } | { error: NextResponse }> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user };
}
