import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { createCipheriv, randomBytes } from "crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function encrypt(plaintext) {
  const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
}

function isBcrypt(str) {
  return str && str.startsWith("$2");
}

// Fix email passwords (seeded with bcrypt, should be AES)
const emailAccounts = await prisma.emailAccount.findMany({ where: { deletedAt: null } });
let emailFixed = 0;
for (const e of emailAccounts) {
  if (isBcrypt(e.password)) {
    await prisma.emailAccount.update({
      where: { id: e.id },
      data: { password: encrypt("hahahihi") },
    });
    emailFixed++;
  }
}
console.log(`Email passwords fixed: ${emailFixed}`);

// Fix social account passwords (GitHub seeded with bcrypt, should be AES)
const socialAccounts = await prisma.socialAccount.findMany({
  where: { platform: "GitHub", deletedAt: null },
});
let socialFixed = 0;
for (const acc of socialAccounts) {
  if (isBcrypt(acc.password)) {
    await prisma.socialAccount.update({
      where: { id: acc.id },
      data: { password: encrypt("Super76##") },
    });
    socialFixed++;
  }
}
console.log(`GitHub passwords fixed: ${socialFixed}`);

await prisma.$disconnect();
