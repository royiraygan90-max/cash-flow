export function isSubscriptionInRange(
  sub: { startMonth: Date | string | null; endMonth: Date | string | null },
  year: number,
  monthIdx: number // 0-indexed
): boolean {
  const targetKey = year * 12 + monthIdx;

  if (sub.startMonth) {
    const s = new Date(sub.startMonth);
    const startKey = s.getFullYear() * 12 + s.getMonth();
    if (targetKey < startKey) return false;
  }
  if (sub.endMonth) {
    const e = new Date(sub.endMonth);
    const endKey = e.getFullYear() * 12 + e.getMonth();
    if (targetKey > endKey) return false;
  }
  return true;
}

export type SubValidityStatus =
  | { kind: "ongoing" }
  | { kind: "upcoming"; startKey: number; total: number }
  | { kind: "ended"; endKey: number; total: number }
  | { kind: "active-limited"; current: number; total: number };

export function getSubValidityStatus(
  sub: { startMonth: Date | string | null; endMonth: Date | string | null },
  now: Date
): SubValidityStatus {
  if (!sub.startMonth || !sub.endMonth) return { kind: "ongoing" };

  const s = new Date(sub.startMonth);
  const e = new Date(sub.endMonth);
  const startKey = s.getFullYear() * 12 + s.getMonth();
  const endKey = e.getFullYear() * 12 + e.getMonth();
  const nowKey = now.getFullYear() * 12 + now.getMonth();
  const total = endKey - startKey + 1;

  if (nowKey < startKey) return { kind: "upcoming", startKey, total };
  if (nowKey > endKey) return { kind: "ended", endKey, total };
  return { kind: "active-limited", current: nowKey - startKey + 1, total };
}
