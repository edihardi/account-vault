import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { verifyPassword } from "@/lib/hash";
import { decrypt, decryptOptional } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const password: string = body?.password ?? "";
  if (!password) {
    return NextResponse.json({ error: "Password diperlukan" }, { status: 400 });
  }

  const config = await prisma.appConfig.findFirst();
  if (!config) return NextResponse.json({ error: "App belum di-setup" }, { status: 500 });

  const valid = await verifyPassword(password, config.masterPassHash);
  if (!valid) {
    return NextResponse.json({ error: "Password salah" }, { status: 403 });
  }

  const emails = await prisma.emailAccount.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
      emailAddress: true,
      password: true,
      provider: true,
      recoveryEmail: true,
      proxy: true,
      status: true,
      notes: true,
      socialAccounts: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: {
          platform: true,
          username: true,
          phone: true,
          password: true,
          token: true,
          totpSeed: true,
          extraData: true,
          status: true,
          notes: true,
        },
      },
    },
  });

  const data = {
    exportedAt: new Date().toISOString(),
    total: emails.length,
    emails: emails.map(e => ({
      emailAddress: e.emailAddress,
      password: decrypt(e.password),
      provider: e.provider,
      recoveryEmail: decryptOptional(e.recoveryEmail),
      proxy: e.proxy ?? null,
      status: e.status,
      notes: e.notes ?? null,
      socialAccounts: e.socialAccounts.map(a => ({
        platform: a.platform,
        username: a.username ?? null,
        phone: a.phone ?? null,
        password: decryptOptional(a.password),
        token: decryptOptional(a.token),
        totpSeed: decryptOptional(a.totpSeed),
        extraData: a.extraData ?? null,
        status: a.status,
        notes: a.notes ?? null,
      })),
    })),
  };

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="account-vault-${date}.json"`,
    },
  });
}
