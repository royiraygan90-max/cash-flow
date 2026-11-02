import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { parseRuleFields, saveRule, settleWaiting } from "@/lib/merchantRules";

/** Adds a rule (or replaces the category and note of the one for the same merchant and amount). */
export async function POST(req: NextRequest) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  const fields = parseRuleFields(await req.json().catch(() => null));
  if (!fields) return NextResponse.json({ error: "Invalid rule" }, { status: 400 });

  const rule = await saveRule(auth.user.id, fields);
  const settled = await settleWaiting(auth.user.id, fields);
  return NextResponse.json({ rule, settled }, { status: 201 });
}
