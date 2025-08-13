// All calculations are done in cents to avoid floating point inaccuracies.

/**
 * Converts a dollar amount to cents.
 * @param dollars - The amount in dollars (e.g., 29.99)
 * @returns The amount in cents (e.g., 2999)
 */
export function toCents(dollars: number | string): number {
  return Math.round(Number(dollars) * 100);
}

/**
 * Converts a cent amount to a formatted dollar string.
 * @param cents - The amount in cents (e.g., 2999)
 * @returns The formatted dollar string (e.g., "29.99")
 */
export function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Semantic alias for a number representing cents.
 * @param n - The amount in cents.
 * @returns The amount in cents.
 */
export const cents = (n: number): number => n;

/**
 * Rounds a dollar amount to two decimal places.
 * @param amount - The dollar amount
 * @returns The rounded dollar amount
 */
export function roundMoney(amount: number): number {
  return parseFloat(amount.toFixed(2));
}