import { NextRequest, NextResponse } from "next/server";
import { applySync, hasValidSyncKey, parseSyncRequest, resolveSyncUser } from "@/lib/homeHubSync";

/**
 * Receives the shared-household expenses from home-hub (already reduced to this
 * user's share). Authenticated with a shared key rather than the session cookie,
 * since the caller is another server.
 */
export async function POST(req: NextRequest) {
  if (!hasValidSyncKey(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = parseSyncRequest(await req.json().catch(() => null));
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const user = await resolveSyncUser();
    return NextResponse.json(await applySync(user.id, body));
  } catch (err) {
    console.error("[home-hub sync] failed:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
