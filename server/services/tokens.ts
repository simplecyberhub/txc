import crypto from "crypto";

/**
 * Generate a random token for email verification or password reset
 * @returns A random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate an expiry timestamp for a token
 * @param hours Number of hours until expiry
 * @returns Timestamp when the token will expire
 */
export function generateExpiry(hours: number = 24): string {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

/**
 * Check if a timestamp has expired
 * @param timestamp ISO timestamp to check
 * @returns true if expired, false if still valid
 */
export function isExpired(timestamp: string): boolean {
  const expiryDate = new Date(timestamp);
  const now = new Date();
  return now > expiryDate;
}
