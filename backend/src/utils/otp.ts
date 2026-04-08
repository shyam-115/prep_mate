import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/** OTP configuration */
export const OTP_EXPIRY_MS   = 3 * 60 * 1000; // 3 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_BCRYPT_COST  = 10;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute cooldown between resends

/**
 * Generate a cryptographically secure 6-digit OTP string.
 * Uses crypto.randomInt which pulls from the OS CSPRNG.
 */
export function generateOtp(): string {
  // Returns integer in [0, 1_000_000) then zero-pads to 6 digits
  const raw = crypto.randomInt(0, 1_000_000);
  return raw.toString().padStart(6, '0');
}

/**
 * Hash a raw OTP using bcrypt before storing to DB.
 * Even if the DB is breached the OTP cannot be recovered in time.
 */
export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, OTP_BCRYPT_COST);
}

/**
 * Constant-time comparison of raw OTP against a stored bcrypt hash.
 * Returns true only if the OTP is correct.
 */
export async function verifyOtp(raw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(raw, hash);
}
