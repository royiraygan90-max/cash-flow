import { NextRequest, NextResponse } from "next/server";
import { applyShiftWindow, applySync, applyUpcoming, hasValidSyncKey, parseSyncRequest, resolveSyncUser } from "@/lib/homeHubSync";

/**
 * Receives from home-hub the shared-household expenses (already reduced to this
 * user's share), the subscription charges it still expects this month, and this user's work shifts from the calendar. Authenticated with a shared key rather than the session cookie,
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
    const expenses = await applySync(user.id, body);
    const shifts = body.shifts ? await applyShiftWindow(user.id, body.shifts) : null;
    const upcoming = body.upcoming ? await applyUpcoming(user.id, body.upcoming) : null;
    return NextResponse.json({ ...expenses, shifts, upcoming });
  } catch (err) {
    console.error("[home-hub sync] failed:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
