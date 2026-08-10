function computeShiftWindow(date: Date, startTime: string, endTime: string) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const shiftStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), sh, sm);
  let shiftEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), eh, em);
  if (shiftEnd <= shiftStart) shiftEnd = new Date(shiftEnd.getTime() + 24 * 60 * 60 * 1000);

  // Most-recent Friday 16:00 is always the start of the relevant Shabbat window.
  // The window runs exactly 36 h: Fri 16:00 → Sun 04:00.
  const daysSinceFriday = (shiftStart.getDay() - 5 + 7) % 7;
  const windowStart = new Date(shiftStart);
  windowStart.setDate(windowStart.getDate() - daysSinceFriday);
  windowStart.setHours(16, 0, 0, 0);
  const windowEnd = new Date(windowStart.getTime() + 36 * 60 * 60 * 1000);

  return {
    shiftStartMs: shiftStart.getTime(),
    shiftEndMs: shiftEnd.getTime(),
    windowStartMs: windowStart.getTime(),
    windowEndMs: windowEnd.getTime(),
  };
}

function overlapHours(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  const start = Math.max(aStart, bStart);
  const end = Math.min(aEnd, bEnd);
  return Math.max(0, end - start) / 3_600_000;
}

export function splitShiftHours(
  date: Date,
  startTime: string,
  endTime: string
): { regularHours: number; shabbatHours: number; totalHours: number } {
  const { shiftStartMs, shiftEndMs, windowStartMs, windowEndMs } = computeShiftWindow(date, startTime, endTime);
  const shabbatHours = overlapHours(shiftStartMs, shiftEndMs, windowStartMs, windowEndMs);
  const totalHours = (shiftEndMs - shiftStartMs) / 3_600_000;
  return { regularHours: totalHours - shabbatHours, shabbatHours, totalHours };
}

// Standard Israeli daily overtime: hours 9-10 of a single shift pay 125% of
// the applicable base rate, hour 11 onward pays 150%. Each tier is split
// further by Shabbat-window overlap, since the premium stacks on whichever
// base rate (regular or Shabbat) actually applies to that hour.
const DAILY_OT_THRESHOLD_HOURS = 8;
const OT_TIER2_THRESHOLD_HOURS = 10;

export interface ShiftOvertimeBreakdown {
  regularHours: number;
  shabbatHours: number;
  ot125RegularHours: number;
  ot125ShabbatHours: number;
  ot150RegularHours: number;
  ot150ShabbatHours: number;
  totalHours: number;
}

export function splitShiftHoursWithOvertime(
  date: Date,
  startTime: string,
  endTime: string
): ShiftOvertimeBreakdown {
  const { shiftStartMs, shiftEndMs, windowStartMs, windowEndMs } = computeShiftWindow(date, startTime, endTime);

  const eightHMs = shiftStartMs + DAILY_OT_THRESHOLD_HOURS * 3_600_000;
  const tenHMs = shiftStartMs + OT_TIER2_THRESHOLD_HOURS * 3_600_000;

  const tier0Start = shiftStartMs;
  const tier0End = Math.min(shiftEndMs, eightHMs);
  const tier125Start = Math.max(shiftStartMs, eightHMs);
  const tier125End = Math.min(shiftEndMs, tenHMs);
  const tier150Start = Math.max(shiftStartMs, tenHMs);
  const tier150End = shiftEndMs;

  const tier0Total = Math.max(0, tier0End - tier0Start) / 3_600_000;
  const tier125Total = Math.max(0, tier125End - tier125Start) / 3_600_000;
  const tier150Total = Math.max(0, tier150End - tier150Start) / 3_600_000;

  const tier0Shabbat = overlapHours(tier0Start, tier0End, windowStartMs, windowEndMs);
  const tier125Shabbat = overlapHours(tier125Start, tier125End, windowStartMs, windowEndMs);
  const tier150Shabbat = overlapHours(tier150Start, tier150End, windowStartMs, windowEndMs);

  return {
    regularHours: tier0Total - tier0Shabbat,
    shabbatHours: tier0Shabbat,
    ot125RegularHours: tier125Total - tier125Shabbat,
    ot125ShabbatHours: tier125Shabbat,
    ot150RegularHours: tier150Total - tier150Shabbat,
    ot150ShabbatHours: tier150Shabbat,
    totalHours: (shiftEndMs - shiftStartMs) / 3_600_000,
  };
}

export function isOvernightShift(startTime: string, endTime: string): boolean {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return eh * 60 + em <= sh * 60 + sm;
}

export function formatHoursAsClock(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

export function calcShiftPay(regularHours: number, shabbatHours: number, regularRate: number, shabbatRate: number): number {
  return regularHours * regularRate + shabbatHours * shabbatRate;
}

export function calcShiftPayWithOvertime(
  breakdown: ShiftOvertimeBreakdown,
  regularRate: number,
  shabbatRate: number
): number {
  return (
    breakdown.regularHours * regularRate +
    breakdown.shabbatHours * shabbatRate +
    breakdown.ot125RegularHours * regularRate * 1.25 +
    breakdown.ot125ShabbatHours * shabbatRate * 1.25 +
    breakdown.ot150RegularHours * regularRate * 1.5 +
    breakdown.ot150ShabbatHours * shabbatRate * 1.5
  );
}
