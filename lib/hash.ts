import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash password atau PIN menggunakan bcrypt.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Verifikasi plaintext terhadap bcrypt hash.
 */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Validasi format PIN — harus tepat 6 digit angka.
 */
export function isValidPin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}
