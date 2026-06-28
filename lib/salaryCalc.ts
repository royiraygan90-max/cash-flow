import {
  REGULAR_RATE,
  SHABBAT_RATE,
  MONTHLY_BONUS,
  TRAVEL_ALLOWANCE,
  PENSION_PCT,
  STUDY_FUND_PCT,
  CREDIT_POINTS,
  CREDIT_POINT_VALUE,
} from "./salaryConstants";

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

export interface SalaryBreakdown {
  regularPay: number;
  shabbatPay: number;
  basePay: number;
  bonus: number;
  referralBonus: number;
  travel: number;
  gross: number;
  incomeTax: number;
  bituachLeumiHealth: number;
  pension: number;
  studyFund: number;
  totalDeductions: number;
  net: number;
}

export function computeSalary(regularHours: number, shabbatHours: number, referralCount = 0): SalaryBreakdown {
  const regularPay   = regularHours * REGULAR_RATE;
  const shabbatPay   = shabbatHours * SHABBAT_RATE;
  const basePay      = regularPay + shabbatPay;
  const bonus        = MONTHLY_BONUS;
  const referralBonus = referralCount * REFERRAL_BONUS_AMOUNT;
  const travel       = TRAVEL_ALLOWANCE;

  // fiscalBase excludes travel — travel is exempt from income tax, Bituach Leumi,
  // pension, and study-fund base per standard Israeli payroll practice.
  const fiscalBase = basePay + bonus + referralBonus;
  const gross      = fiscalBase + travel;

  const incomeTax           = calcIncomeTax(fiscalBase);
  const bituachLeumiHealth  = calcBituachLeumiHealth(fiscalBase);
  const pension             = fiscalBase * PENSION_PCT;
  const studyFund           = fiscalBase * STUDY_FUND_PCT;
  const totalDeductions     = incomeTax + bituachLeumiHealth + pension + studyFund;
  const net                 = gross - totalDeductions;

  return {
    regularPay,
    shabbatPay,
    basePay,
    bonus,
    referralBonus,
    travel,
    gross,
    incomeTax,
    bituachLeumiHealth,
    pension,
    studyFund,
    totalDeductions,
    net,
  };
}
