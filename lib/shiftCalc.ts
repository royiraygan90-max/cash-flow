import { REGULAR_RATE, SHABBAT_RATE } from "./salaryConstants";

export function calcShiftHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let startMinutes = sh * 60 + sm;
  let endMinutes = eh * 60 + em;
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;
  return (endMinutes - startMinutes) / 60;
}

export function isShabbatShift(date: Date, startTime: string): boolean {
  const day = date.getDay(); // 0=Sunday … 6=Saturday
  const hour = parseInt(startTime.split(":")[0], 10);
  return (day === 5 && hour >= 19) || day === 6 || (day === 0 && hour < 4);
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

export function calcShiftPay(hours: number, isShabbat: boolean): number {
  return hours * (isShabbat ? SHABBAT_RATE : REGULAR_RATE);
}
