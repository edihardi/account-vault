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

// [email, discord_tag, username]
// discord_tag disimpan di extraData, username = login username Discord
const data = [
  ["edihardiansyahh@gmail.com",   "liquidgtx#2884", "arbiscan"],
  ["edihardiansyah.ms@gmail.com", "zeusrtx#4240",   "javascript_js"],
  ["edihardiansyah8@gmail.com",   "apollo#7449",    "apolloku"],
  ["edihardiansyah.8@gmail.com",  "berlin#5516",    "spotifyi"],
  ["maariioonoo@gmail.com",       "helsinki#2974",  "telkomzel"],
  ["Santikayuli787+1@gmail.com",  "havana#6725",    "elistica"],
  ["asnisarah68@gmail.com",       null,             "asnisarah"],
  ["bungabesar60@gmail.com",      null,             "0xbigflower"],
  ["ernisaloma@gmail.com",        null,             "0xsaloma"],
];

let inserted = 0, skipped = 0, notfound = 0;

for (const [email, discordTag, username] of data) {
  const emailAccount = await prisma.emailAccount.findFirst({
    where: { emailAddress: { equals: email, mode: "insensitive" } },
  });
  if (!emailAccount) {
    console.log("NOT FOUND:", email);
    notfound++;
    continue;
  }

  const exists = await prisma.socialAccount.findFirst({
    where: { emailId: emailAccount.id, platform: "Discord" },
  });
  if (exists) {
    console.log("SKIP:", email, username);
    skipped++;
    continue;
  }

  await prisma.socialAccount.create({
    data: {
      emailId: emailAccount.id,
      platform: "Discord",
      username,
      password: encrypt("hahahihi"),
      extraData: discordTag ?? undefined,
    },
  });
  console.log("ADD: ", email, "→", username, discordTag ? `(${discordTag})` : "");
  inserted++;
}

console.log(`\nDone — inserted: ${inserted} | skipped: ${skipped} | not found: ${notfound}`);
await prisma.$disconnect();
