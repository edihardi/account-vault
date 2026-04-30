import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const data = [
  ["usarudin681@gmail.com",       "@codeudin"],
  ["edihardiansyahh@gmail.com",   "@liquidgtx"],
  ["edihardiansyah6@gmail.com",   "@codeansyah"],
  ["edihardiansyah8@gmail.com",   "@zeusrtx"],
  ["febiansyahregi@gmail.com",    "@regifban"],
  ["azrilfirmansyah14@gmail.com", "@azrilfrmn"],
  ["riiskiibudii@gmail.com",      "@coderiski"],
  ["edihardiansyah.ms@gmail.com", "@edihardi"],
  ["maariioonoo@gmail.com",       "@maryocode"],
  ["miqbal.bio17@gmail.com",      "@iqbalfz"],
  ["Santikayuli787@gmail.com",    "@codeyeji"],
  ["ediihardiiansyah@gmail.com",  "@edimegamen"],
  ["liyasariga2@gmail.com",       "@coderiga"],
  ["sriningsih.ms@gmail.com",     "@srikandijs"],
  ["weko3929@gmail.com",          "@wekopy"],
  ["mariono.gtx@gmail.com",       "@marionodev"],
  ["edihardiansyah51@gmail.com",  "@devhardi"],
  ["bybitbar@gmail.com",          "@rakamind"],
  ["nabatikuntul@gmail.com",      "@zidanjs"],
  ["snickskilts245@gmail.com",    "@nikitaphp"],
  ["uangkoyy718@gmail.com",       "@redorefsi"],
  ["lickerberger70@gmail.com",    "@troyadev"],
  ["bungabesar60@gmail.com",      "@arvinjs"],
  ["bukanmungkin@gmail.com",      "@penarajs"],
  ["goyangtalang@gmail.com",      "@guptago"],
  ["fsadboy770@gmail.com",        "@arsakadev"],
  ["sukronjawa29@gmail.com",      "@sukrondev"],
  ["sadboyf936@gmail.com",        "@daesukejs"],
  ["trydothebest01@gmail.com",    "@devdadar"],
  ["trydothebest02@gmail.com",    "@bayuwagung"],
  ["trydothebest03@gmail.com",    "@ferdianbios"],
  ["trydothebest04@gmail.com",    "@septianfe"],
];

const hash = await bcrypt.hash("Super76##", 10);
let inserted = 0, skipped = 0, notfound = 0;

for (const [email, username] of data) {
  const emailAccount = await prisma.emailAccount.findFirst({
    where: { emailAddress: { equals: email, mode: "insensitive" } },
  });
  if (!emailAccount) {
    console.log("NOT FOUND:", email);
    notfound++;
    continue;
  }

  const exists = await prisma.socialAccount.findFirst({
    where: { emailId: emailAccount.id, platform: "GitHub", username },
  });
  if (exists) {
    console.log("SKIP:", email, username);
    skipped++;
    continue;
  }

  await prisma.socialAccount.create({
    data: { emailId: emailAccount.id, platform: "GitHub", username, password: hash },
  });
  console.log("ADD: ", email, "→", username);
  inserted++;
}

console.log(`\nDone — inserted: ${inserted} | skipped: ${skipped} | not found: ${notfound}`);
await prisma.$disconnect();
