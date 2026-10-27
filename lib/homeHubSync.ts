import { createHash, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { splitShiftHours } from "@/lib/shiftCalc";

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

export type IncomingShift = {
  externalId: string;
  /** The day the shift starts on, yyyy-mm-dd */
  date: string;
  startTime: string;
  endTime: string;
};

/**
 * Every shift home-hub has between `from` (inclusive) and `to` (exclusive). The
 * window is reconciled: synced shifts in it that are not listed are removed.
 */
export type ShiftWindow = { from: string; to: string; items: IncomingShift[] };

export type SyncRequest = {
  upserts: IncomingExpense[];
  deletes: string[];
  /** Backfill mode: don't create a row that looks like one already entered by hand */
  dedupe: boolean;
  shifts: ShiftWindow | null;
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

const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/;

function parseShiftWindow(raw: unknown): ShiftWindow | null {
  if (!raw || typeof raw !== "object") return null;
  const { from, to, items } = raw as Record<string, unknown>;
  if (typeof from !== "string" || typeof to !== "string" || !DAY.test(from) || !DAY.test(to) || from >= to) return null;
  if (Number.isNaN(new Date(from).getTime()) || Number.isNaN(new Date(to).getTime())) return null;
  if (!Array.isArray(items) || items.length > MAX_BATCH) return null;

  const parsed: IncomingShift[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") return null;
    const s = item as Record<string, unknown>;
    if (typeof s.externalId !== "string" || !s.externalId) return null;
    if (typeof s.date !== "string" || !DAY.test(s.date) || s.date < from || s.date >= to) return null;
    if (typeof s.startTime !== "string" || !CLOCK.test(s.startTime)) return null;
    if (typeof s.endTime !== "string" || !CLOCK.test(s.endTime)) return null;
    parsed.push({ externalId: s.externalId, date: s.date, startTime: s.startTime, endTime: s.endTime });
  }
  return { from, to, items: parsed };
}

/** Returns null when the body isn't a well-formed request. */
export function parseSyncRequest(body: unknown): SyncRequest | null {
  if (!body || typeof body !== "object") return null;
  const { upserts = [], deletes = [], dedupe = false, shifts = null } = body as Record<string, unknown>;
  if (!Array.isArray(upserts) || !Array.isArray(deletes)) return null;
  if (upserts.length + deletes.length > MAX_BATCH) return null;

  const parsed = upserts.map(parseExpense);
  if (parsed.some((e) => e === null)) return null;
  if (!deletes.every((id) => typeof id === "string" && id)) return null;

  const window = shifts === null ? null : parseShiftWindow(shifts);
  if (shifts !== null && window === null) return null;

  return { upserts: parsed as IncomingExpense[], deletes: deletes as string[], dedupe: dedupe === true, shifts: window };
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

export type ShiftLookalike = { externalId: string; date: string; startTime: string; endTime: string; existingId: string };

/**
 * Makes the home-hub shifts in the window match `window.items`: creates and updates
 * them (hours are worked out here, the same way a shift entered by hand is), removes
 * synced ones that are no longer listed, and never touches shifts entered by hand. A
 * listed shift with the same day and hours as one entered by hand is skipped and
 * reported rather than counted twice.
 */
export async function applyShiftWindow(userId: string, window: ShiftWindow) {
  const from = new Date(window.from);
  const to = new Date(window.to);
  const current = await prisma.shift.findMany({
    where: { userId, source: HOME_HUB_SOURCE, date: { gte: from, lt: to } },
  });
  const byExternalId = new Map(current.map((s) => [s.externalId, s]));

  let created = 0;
  let updated = 0;
  const skipped: ShiftLookalike[] = [];

  for (const item of window.items) {
    const date = new Date(item.date);
    const split = splitShiftHours(date, item.startTime, item.endTime);
    const fields = {
      date,
      startTime: item.startTime,
      endTime: item.endTime,
      hours: split.totalHours,
      regularHours: split.regularHours,
      shabbatHours: split.shabbatHours,
    };

    const synced = byExternalId.get(item.externalId);
    if (synced) {
      const same =
        synced.date.getTime() === date.getTime() &&
        synced.startTime === fields.startTime &&
        synced.endTime === fields.endTime &&
        synced.hours === fields.hours &&
        synced.regularHours === fields.regularHours &&
        synced.shabbatHours === fields.shabbatHours;
      if (!same) {
        await prisma.shift.update({ where: { id: synced.id }, data: fields });
        updated++;
      }
      byExternalId.delete(item.externalId);
      continue;
    }

    const lookalike = await prisma.shift.findFirst({
      where: { userId, source: null, date, startTime: item.startTime, endTime: item.endTime },
      select: { id: true },
    });
    if (lookalike) {
      skipped.push({ externalId: item.externalId, date: item.date, startTime: item.startTime, endTime: item.endTime, existingId: lookalike.id });
      continue;
    }

    await prisma.shift.create({
      data: { ...fields, userId, source: HOME_HUB_SOURCE, externalId: item.externalId },
    });
    created++;
  }

  // What is left was synced earlier but is no longer on the calendar
  const stale = Array.from(byExternalId.values()).map((s) => s.id);
  const removed = stale.length ? await prisma.shift.deleteMany({ where: { id: { in: stale } } }) : { count: 0 };

  return { created, updated, deleted: removed.count, skipped };
}
