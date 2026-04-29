import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { decrypt, decryptOptional } from "@/lib/crypto";
import { isPinSessionActive } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const email = await prisma.emailAccount.findUnique({
    where: { id },
    include: {
      socialAccounts: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!email || email.deletedAt) {
    return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
  }

  const pinActive = isPinSessionActive(session);

  return NextResponse.json({
    ...email,
    password: pinActive ? decrypt(email.password) : null,
    socialAccounts: email.socialAccounts.map((acc) => ({
      ...acc,
      password: pinActive ? decryptOptional(acc.password) : null,
      token: pinActive ? decryptOptional(acc.token) : null,
      totpSeed: pinActive ? decryptOptional(acc.totpSeed) : null,
      extraData: pinActive ? decryptOptional(acc.extraData) : null,
    })),
  });
}
