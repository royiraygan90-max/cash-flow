import { REGULAR_RATE, SHABBAT_RATE } from "./salaryConstants";

export function splitShiftHours(
  date: Date,
  startTime: string,
  endTime: string
): { regularHours: number; shabbatHours: number; totalHours: number } {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const shiftStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), sh, sm);
  let shiftEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), eh, em);
  if (shiftEnd <= shiftStart) shiftEnd = new Date(shiftEnd.getTime() + 24 * 60 * 60 * 1000);

  // Most-recent Friday 19:00 is always the start of the relevant Shabbat window.
  // The window runs exactly 33 h: Fri 19:00 → Sun 04:00.
  const daysSinceFriday = (shiftStart.getDay() - 5 + 7) % 7;
  const windowStart = new Date(shiftStart);
  windowStart.setDate(windowStart.getDate() - daysSinceFriday);
  windowStart.setHours(19, 0, 0, 0);
  const windowEnd = new Date(windowStart.getTime() + 33 * 60 * 60 * 1000);

  const overlapStart = Math.max(shiftStart.getTime(), windowStart.getTime());
  const overlapEnd   = Math.min(shiftEnd.getTime(),   windowEnd.getTime());
  const shabbatMs    = Math.max(0, overlapEnd - overlapStart);
  const totalMs      = shiftEnd.getTime() - shiftStart.getTime();

  const shabbatHours = shabbatMs / 3_600_000;
  const totalHours   = totalMs   / 3_600_000;
  return { regularHours: totalHours - shabbatHours, shabbatHours, totalHours };
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

export function calcShiftPay(regularHours: number, shabbatHours: number): number {
  return regularHours * REGULAR_RATE + shabbatHours * SHABBAT_RATE;
}
