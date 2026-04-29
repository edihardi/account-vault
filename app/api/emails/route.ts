import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const emails = await prisma.emailAccount.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      emailAddress: true,
      provider: true,
      status: true,
      notes: true,
      proxy: true,
      createdAt: true,
      _count: { select: { socialAccounts: { where: { deletedAt: null } } } },
    },
  });

  return NextResponse.json(emails);
}
