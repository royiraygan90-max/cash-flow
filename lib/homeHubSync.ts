import { createHash, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

export const HOME_HUB_SOURCE = "home-hub";
const MAX_BATCH = 500;

export type IncomingExpense = {
  externalId: string;
  /** Calendar day, yyyy-mm-dd — stored the same way a manually entered date is */
  date: string;
  category: string;
  description: string;
  amount: number;
};

export type SyncRequest = {
  upserts: IncomingExpense[];
  deletes: string[];
  /** Backfill mode: don't create a row that looks like one already entered by hand */
  dedupe: boolean;
};

export type DuplicateReport = {
  externalId: string;
  incoming: IncomingExpense;
  existing: { id: string; date: string; category: string; description: string; amount: number }[];
};

const digest = (value: string) => createHash("sha256").update(value).digest();

/** Constant-time check of "Authorization: Bearer <key>" against HOME_HUB_SYNC_KEY. */
export function hasValidSyncKey(authorization: string | null): boolean {
  const key = process.env.HOME_HUB_SYNC_KEY;
  if (!key || !authorization?.startsWith("Bearer ")) return false;
  return timingSafeEqual(digest(authorization.slice("Bearer ".length)), digest(key));
}

/**
 * Who the synced expenses belong to: the user named in HOME_HUB_SYNC_USER, or
 * the only user there is. Anything ambiguous is an error rather than a guess.
 */
export async function resolveSyncUser() {
  const name = process.env.HOME_HUB_SYNC_USER?.trim();
  if (name) {
    const matches = await prisma.user.findMany({ where: { name }, take: 2 });
    if (matches.length === 1) return matches[0];
    throw new Error(`HOME_HUB_SYNC_USER "${name}" matches ${matches.length} users`);
  }
  const users = await prisma.user.findMany({ take: 2 });
  if (users.length === 1) return users[0];
  throw new Error("Set HOME_HUB_SYNC_USER: there is not exactly one user");
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;

function parseExpense(raw: unknown): IncomingExpense | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  if (typeof e.externalId !== "string" || !e.externalId) return null;
  if (typeof e.date !== "string" || !DAY.test(e.date) || Number.isNaN(new Date(e.date).getTime())) return null;
  if (typeof e.category !== "string" || !e.category.trim()) return null;
  if (typeof e.amount !== "number" || !Number.isFinite(e.amount) || e.amount <= 0) return null;
  const description = typeof e.description === "string" ? e.description : "";
  return {
    externalId: e.externalId,
    date: e.date,
    category: e.category.trim().slice(0, 60),
    description: description.slice(0, 200),
    amount: e.amount,
  };
}

/** Returns null when the body isn't a well-formed request. */
export function parseSyncRequest(body: unknown): SyncRequest | null {
  if (!body || typeof body !== "object") return null;
  const { upserts = [], deletes = [], dedupe = false } = body as Record<string, unknown>;
  if (!Array.isArray(upserts) || !Array.isArray(deletes)) return null;
  if (upserts.length + deletes.length > MAX_BATCH) return null;

  const parsed = upserts.map(parseExpense);
  if (parsed.some((e) => e === null)) return null;
  if (!deletes.every((id) => typeof id === "string" && id)) return null;

  return { upserts: parsed as IncomingExpense[], deletes: deletes as string[], dedupe: dedupe === true };
}

/** Entered by hand (not synced) on the same day for the same amount. */
async function findLookalikes(userId: string, e: IncomingExpense) {
  const dayStart = new Date(e.date);
  const nextDay = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const rows = await prisma.transaction.findMany({
    where: { userId, type: "expense", source: null, amount: e.amount, date: { gte: dayStart, lt: nextDay } },
  });
  return rows.map((r) => ({
    id: r.id,
    date: r.date.toISOString().slice(0, 10),
    category: r.category,
    description: r.description,
    amount: r.amount,
  }));
}

export async function applySync(userId: string, req: SyncRequest) {
  let created = 0;
  let updated = 0;
  const duplicates: DuplicateReport[] = [];

  for (const e of req.upserts) {
    const key = { userId_source_externalId: { userId, source: HOME_HUB_SOURCE, externalId: e.externalId } };
    const fields = {
      date: new Date(e.date),
      category: e.category,
      description: e.description,
      amount: e.amount,
    };

    const synced = await prisma.transaction.findUnique({ where: key, select: { id: true } });
    if (synced) {
      await prisma.transaction.update({ where: key, data: fields });
      updated++;
      continue;
    }

    if (req.dedupe) {
      const existing = await findLookalikes(userId, e);
      if (existing.length > 0) {
        duplicates.push({ externalId: e.externalId, incoming: e, existing });
        continue;
      }
    }

    await prisma.transaction.create({
      data: { ...fields, type: "expense", userId, source: HOME_HUB_SOURCE, externalId: e.externalId },
    });
    created++;
  }

  const removed = req.deletes.length
    ? await prisma.transaction.deleteMany({
        where: { userId, source: HOME_HUB_SOURCE, externalId: { in: req.deletes } },
      })
    : { count: 0 };

  return { created, updated, deleted: removed.count, duplicates };
}
