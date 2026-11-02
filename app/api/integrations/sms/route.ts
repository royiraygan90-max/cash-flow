import { NextRequest, NextResponse } from "next/server";
import { hasValidBearer, resolveSyncUser } from "@/lib/homeHubSync";
import { applySms, parseSmsRequest } from "@/lib/smsSync";

/**
 * Receives the text of a card-charge SMS from the phone (an iOS Shortcut) and adds the
 * expense. Authenticated with its own key rather than the session cookie, since the
 * caller is not a browser.
 *
 * A message that can't be turned into an expense answers 422 with the reason, so the
 * Shortcut can tell the user to enter it by hand instead of losing it silently.
 */
export async function POST(req: NextRequest) {
  if (!hasValidBearer(req.headers.get("authorization"), process.env.SMS_SYNC_KEY)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // The Shortcut sends the message as the plain body; JSON { text, receivedAt? } works too.
  // An SMS never starts with "{", so that is enough to tell them apart.
  const raw = await req.text().catch(() => "");
  let payload: unknown = raw;
  if (raw.trimStart().startsWith("{")) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }
  }
  const body = parseSmsRequest(payload);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const user = await resolveSyncUser(process.env.SMS_SYNC_USER || process.env.HOME_HUB_SYNC_USER);
    const outcome = await applySms(user.id, body);
    if (outcome.status === "unparsed") {
      console.warn("[sms sync] could not parse message:", outcome.reason);
      return NextResponse.json(outcome, { status: 422 });
    }
    return NextResponse.json(outcome, { status: outcome.status === "created" ? 201 : 200 });
  } catch (err) {
    console.error("[sms sync] failed:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
