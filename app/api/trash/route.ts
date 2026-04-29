import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export interface TrashItem {
  type: "email" | "account";
  id: string;
  label: string;
  sublabel: string | null;
  deletedAt: string;
  // untuk akun: parent email info
  parentEmail?: { id: string; emailAddress: string };
}

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [emails, accounts] = await Promise.all([
    prisma.emailAccount.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: {
        id: true,
        emailAddress: true,
        provider: true,
        deletedAt: true,
      },
    }),
    prisma.socialAccount.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: {
        id: true,
        platform: true,
        username: true,
        phone: true,
        deletedAt: true,
        email: { select: { id: true, emailAddress: true } },
      },
    }),
  ]);

  const items: TrashItem[] = [
    ...emails.map(e => ({
      type: "email" as const,
      id: e.id,
      label: e.emailAddress,
      sublabel: e.provider,
      deletedAt: e.deletedAt!.toISOString(),
    })),
    ...accounts.map(a => ({
      type: "account" as const,
      id: a.id,
      label: a.platform,
      sublabel: a.username ?? a.phone ?? null,
      deletedAt: a.deletedAt!.toISOString(),
      parentEmail: a.email,
    })),
  ].sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

  return NextResponse.json(items);
}
