import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const emails = [
  "usarudin681@gmail.com",
  "liyasariga2@gmail.com",
  "sriningsih.ms@gmail.com",
  "weko3929@gmail.com",
  "mariono.gtx@gmail.com",
  "edihardiansyah51@gmail.com",
  "bybitbar@gmail.com",
  "nabatikuntul@gmail.com",
  "snickskilts245@gmail.com",
  "uangkoyy718@gmail.com",
  "lickerberger70@gmail.com",
  "bungabesar60@gmail.com",
  "bukanmungkin@gmail.com",
];

const hash = await bcrypt.hash("hahahihi", 10);
let inserted = 0, skipped = 0;

for (const email of emails) {
  const exists = await prisma.emailAccount.findFirst({
    where: { emailAddress: { equals: email, mode: "insensitive" } },
  });
  if (exists) {
    console.log("SKIP:", email);
    skipped++;
  } else {
    await prisma.emailAccount.create({
      data: { emailAddress: email, password: hash, provider: "Gmail" },
    });
    console.log("ADD: ", email);
    inserted++;
  }
}

console.log(`\nDone — inserted: ${inserted} | skipped: ${skipped}`);
await prisma.$disconnect();
