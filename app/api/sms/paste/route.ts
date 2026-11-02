import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { applySms, parseSmsRequest } from "@/lib/smsSync";

/**
 * Adds a card-charge SMS the user pasted into the app, for the signed-in user. The same
 * parsing and rules as the phone integration, authenticated with the session cookie.
 */
export async function POST(req: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const body = parseSmsRequest(await req.json().catch(() => null));
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  try {
    const outcome = await applySms(auth.user.id, body);
    return NextResponse.json(outcome, { status: outcome.status === "unparsed" ? 422 : outcome.status === "created" ? 201 : 200 });
  } catch (err) {
    console.error("[sms paste] failed:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
