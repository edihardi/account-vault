import { scryptSync, createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";
const SALT_LEN = 32;
const IV_LEN = 12;
const TAG_LEN = 16;

/** Enkripsi backup JSON dengan password (key derivation via scrypt) */
export function encryptBackup(plaintext: string, password: string): Buffer {
  const salt = randomBytes(SALT_LEN);
  const key = scryptSync(password, salt, 32);
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Layout: [salt(32)][iv(12)][tag(16)][ciphertext]
  return Buffer.concat([salt, iv, tag, ciphertext]);
}

/** Dekripsi backup. Throws jika password salah atau data corrupt. */
export function decryptBackup(data: Buffer, password: string): string {
  if (data.length < SALT_LEN + IV_LEN + TAG_LEN + 1) {
    throw new Error("File backup tidak valid atau terlalu pendek");
  }
  const salt = data.subarray(0, SALT_LEN);
  const iv = data.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const tag = data.subarray(SALT_LEN + IV_LEN, SALT_LEN + IV_LEN + TAG_LEN);
  const ciphertext = data.subarray(SALT_LEN + IV_LEN + TAG_LEN);
  const key = scryptSync(password, salt, 32);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext).toString("utf8") + decipher.final("utf8");
}

export interface BackupSocialAccount {
  platform: string;
  username: string | null;
  phone: string | null;
  password: string | null;
  token: string | null;
  totpSeed: string | null;
  extraData: string | null;
  status: string;
  notes: string | null;
}

export interface BackupEmail {
  emailAddress: string;
  password: string;
  provider: string;
  recoveryEmail: string | null;
  proxy: string | null;
  status: string;
  notes: string | null;
  socialAccounts: BackupSocialAccount[];
}

export interface BackupData {
  version: 1;
  exportedAt: string;
  emails: BackupEmail[];
}
