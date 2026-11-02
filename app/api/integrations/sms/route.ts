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
  // Read the whole body before answering anything: replying to an upload that is still in
  // flight (a 401, say) can make a client report a dropped connection instead of the answer.
  // The message text itself is never logged, only what is needed to see what arrived.
  const raw = await req.text().catch(() => "");
  const authorized = hasValidBearer(req.headers.get("authorization"), process.env.SMS_SYNC_KEY);
  console.log(
    `[sms sync] POST bytes=${raw.length} type=${req.headers.get("content-type") ?? "-"} ` +
      `agent=${req.headers.get("user-agent") ?? "-"} auth=${authorized ? "ok" : "bad"}`,
  );
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // The Shortcut sends the message as the plain body; JSON { text, receivedAt? } works too.
  // An SMS never starts with "{", so that is enough to tell them apart.
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
    console.log(`[sms sync] result=${outcome.status}`);
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
