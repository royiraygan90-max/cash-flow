import {
  PENSION_PCT,
  STUDY_FUND_PCT,
  CREDIT_POINTS,
  CREDIT_POINT_VALUE,
} from "./salaryConstants";
import { splitShiftHoursWithOvertime } from "./shiftCalc";

// 2026 monthly income tax brackets. First 4 confirmed via official sources (Jan 2026 bracket-widening reform).
// Top 3 brackets carried over from the original 2025 spec as estimates — irrelevant to this user's actual
// income range (never approaches ₪25,000/month), but kept for completeness. Flag for accountant review
// if income ever changes significantly.
const TAX_BRACKETS_2026: { upTo: number; rate: number }[] = [
  { upTo: 7010,     rate: 0.10 },
  { upTo: 10060,    rate: 0.14 },
  { upTo: 19000,    rate: 0.20 },
  { upTo: 25100,    rate: 0.31 },
  { upTo: 45180,    rate: 0.35 }, // estimate
  { upTo: 58190,    rate: 0.47 }, // estimate
  { upTo: Infinity, rate: 0.50 }, // estimate
];

export function calcIncomeTax(taxableMonthly: number): number {
  let tax = 0;
  let prev = 0;
  for (const bracket of TAX_BRACKETS_2026) {
    if (taxableMonthly <= prev) break;
    const slice = Math.min(taxableMonthly, bracket.upTo) - prev;
    tax += slice * bracket.rate;
    prev = bracket.upTo;
  }
  const credit = CREDIT_POINTS * CREDIT_POINT_VALUE;
  return Math.max(0, tax - credit);
}

// 2026 combined Bituach Leumi + health tax (confirmed via official sources, post תיקון 252).
const BL_HEALTH_THRESHOLD = 7703;
const BL_HEALTH_LOW_RATE  = 0.0427;
const BL_HEALTH_HIGH_RATE = 0.1217;

export function calcBituachLeumiHealth(taxableMonthly: number): number {
  if (taxableMonthly <= BL_HEALTH_THRESHOLD) {
    return taxableMonthly * BL_HEALTH_LOW_RATE;
  }
  return (
    BL_HEALTH_THRESHOLD * BL_HEALTH_LOW_RATE +
    (taxableMonthly - BL_HEALTH_THRESHOLD) * BL_HEALTH_HIGH_RATE
  );
}

export const REFERRAL_BONUS_AMOUNT = 1000;

export interface SalaryProfile {
  regularRate: number;
  shabbatRate: number;
  overtimeEnabled: boolean;
  monthlyBonus: number;
  travelAllowance: number;
  /** Flat monthly deduction outside standard payroll tax (e.g. union/professional dues) — not tied to hours worked. */
  otherDeductions: number;
}

export interface ShiftForPay {
  date: Date;
  startTime: string;
  endTime: string;
  regularHours: number;
  shabbatHours: number;
}

export interface SalaryBreakdown {
  regularPay: number;
  shabbatPay: number;
  overtimePay: number;
  basePay: number;
  bonus: number;
  referralBonus: number;
  travel: number;
  gross: number;
  incomeTax: number;
  bituachLeumiHealth: number;
  pension: number;
  studyFund: number;
  otherDeductions: number;
  totalDeductions: number;
  net: number;
}

export function computeSalary(shifts: ShiftForPay[], profile: SalaryProfile, referralCount = 0): SalaryBreakdown {
  let regularHours = 0;
  let shabbatHours = 0;
  let ot125RegularHours = 0;
  let ot125ShabbatHours = 0;
  let ot150RegularHours = 0;
  let ot150ShabbatHours = 0;

  if (!profile.overtimeEnabled) {
    // Fast path: stored per-shift totals already split by Shabbat window,
    // no per-shift recomputation needed since there's no daily threshold to apply.
    for (const sh of shifts) {
      regularHours += sh.regularHours;
      shabbatHours += sh.shabbatHours;
    }
  } else {
    for (const sh of shifts) {
      const b = splitShiftHoursWithOvertime(sh.date, sh.startTime, sh.endTime);
      regularHours += b.regularHours;
      shabbatHours += b.shabbatHours;
      ot125RegularHours += b.ot125RegularHours;
      ot125ShabbatHours += b.ot125ShabbatHours;
      ot150RegularHours += b.ot150RegularHours;
      ot150ShabbatHours += b.ot150ShabbatHours;
    }
  }

  const regularPay = regularHours * profile.regularRate;
  const shabbatPay = shabbatHours * profile.shabbatRate;
  const overtimePay =
    ot125RegularHours * profile.regularRate * 1.25 +
    ot125ShabbatHours * profile.shabbatRate * 1.25 +
    ot150RegularHours * profile.regularRate * 1.5 +
    ot150ShabbatHours * profile.shabbatRate * 1.5;

  const basePay      = regularPay + shabbatPay + overtimePay;
  const bonus        = profile.monthlyBonus;
  const referralBonus = referralCount * REFERRAL_BONUS_AMOUNT;
  const travel       = profile.travelAllowance;

  // fiscalBase excludes travel — travel is exempt from income tax, Bituach Leumi,
  // pension, and study-fund base per standard Israeli payroll practice.
  const fiscalBase = basePay + bonus + referralBonus;
  const gross      = fiscalBase + travel;

  // Pension is calculated on basePay only — bonuses and referral bonuses are
  // typically not pensionable. Note this is still an approximation: real
  // pensionable/study-fund-eligible salary is often pinned by the employer's
  // agreement to a near-fixed reference wage rather than actual hours worked
  // that month, which this model can't replicate without that reference figure.
  const incomeTax           = calcIncomeTax(fiscalBase);
  const bituachLeumiHealth  = calcBituachLeumiHealth(fiscalBase);
  const pension             = basePay * PENSION_PCT;
  const studyFund           = fiscalBase * STUDY_FUND_PCT;
  const otherDeductions     = profile.otherDeductions;
  const totalDeductions     = incomeTax + bituachLeumiHealth + pension + studyFund + otherDeductions;
  const net                 = gross - totalDeductions;

  return {
    regularPay,
    shabbatPay,
    overtimePay,
    basePay,
    bonus,
    referralBonus,
    travel,
    gross,
    incomeTax,
    bituachLeumiHealth,
    pension,
    studyFund,
    otherDeductions,
    totalDeductions,
    net,
  };
}

export interface SalaryTargetInput {
  targetNet: number;
  shabbatShare: number; // 0-1: fraction of worked hours that are Shabbat hours
  regularRate: number;
  shabbatRate: number;
  monthlyBonus: number;
  travelAllowance: number;
  referralBonus?: number;
  otherDeductions?: number;
}

export interface SalaryTargetResult {
  totalHours: number;
  regularHours: number;
  shabbatHours: number;
  basePay: number;
  fiscalBase: number;
  gross: number;
  net: number;
}

// Pension is basePay-only (see computeSalary), so unlike the other deductions
// it isn't a pure function of fiscalBase — search over basePay directly, with
// bonus/referralBonus/travelAllowance/otherDeductions as fixed known terms.
function netFromBasePay(
  basePay: number,
  bonus: number,
  referralBonus: number,
  travelAllowance: number,
  otherDeductions: number
): number {
  const fiscalBase         = basePay + bonus + referralBonus;
  const incomeTax          = calcIncomeTax(fiscalBase);
  const bituachLeumiHealth = calcBituachLeumiHealth(fiscalBase);
  const pension            = basePay * PENSION_PCT;
  const studyFund          = fiscalBase * STUDY_FUND_PCT;
  return fiscalBase + travelAllowance - incomeTax - bituachLeumiHealth - pension - studyFund - otherDeductions;
}

// Inverts computeSalary: given a target net salary and a desired mix of
// regular vs. Shabbat hours, finds the required hours and gross. Every
// marginal deduction rate sums to well under 100%, so net is strictly
// increasing in basePay — a binary search finds the unique match without
// needing to invert the tax brackets algebraically.
export function calcHoursForTargetNet(input: SalaryTargetInput): SalaryTargetResult {
  const {
    targetNet,
    shabbatShare,
    regularRate,
    shabbatRate,
    monthlyBonus,
    travelAllowance,
    referralBonus = 0,
    otherDeductions = 0,
  } = input;

  const net = (basePay: number) => netFromBasePay(basePay, monthlyBonus, referralBonus, travelAllowance, otherDeductions);

  let lo = 0;
  let hi = Math.max(targetNet, 1000);
  while (net(hi) < targetNet && hi < 10_000_000) hi *= 2;

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (net(mid) < targetNet) lo = mid;
    else hi = mid;
  }

  const basePay      = hi;
  const fiscalBase   = basePay + monthlyBonus + referralBonus;
  const blendedRate  = (1 - shabbatShare) * regularRate + shabbatShare * shabbatRate;
  const totalHours   = blendedRate > 0 ? basePay / blendedRate : 0;
  const shabbatHours = totalHours * shabbatShare;
  const regularHours = totalHours - shabbatHours;

  return {
    totalHours,
    regularHours,
    shabbatHours,
    basePay,
    fiscalBase,
    gross: fiscalBase + travelAllowance,
    net: net(basePay),
  };
}
