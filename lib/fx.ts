/**
 * A rough conversion to shekels for a card charge made in another currency. The SMS only says
 * "USD 20.00", not what the bank will bill. The result is an estimate: the charge waits on
 * the dashboard with the original amount shown, and the user can correct the figure there.
 *
 * Rates are shekels per one unit, rounded, and only meant to land in the right ballpark.
 * A currency not listed here gets 0 and has to be filled in by hand.
 */
const SHEKELS_PER_UNIT: Record<string, number> = {
  USD: 3.3,
  EUR: 3.8,
  GBP: 4.4,
};

export function estimateShekels(amount: number, currency: string): number {
  if (currency === "ILS") return amount;
  const rate = SHEKELS_PER_UNIT[currency];
  return rate ? Math.round(amount * rate * 100) / 100 : 0;
}
