import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export interface SearchResultItem {
  type: "email" | "account";
  id: string;
  // email
  emailAddress?: string;
  provider?: string;
  // account
  platform?: string;
  username?: string | null;
  phone?: string | null;
  // shared
  status: string;
  notes?: string | null;
  // reverse lookup — parent email dari akun sosmed
  parentEmail?: { id: string; emailAddress: string; provider: string };
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const [emails, accounts] = await Promise.all([
    // Cari di EmailAccount
    prisma.emailAccount.findMany({
      where: {
        deletedAt: null,
        OR: [
          { emailAddress: { contains: q } },
          { provider:      { contains: q } },
          { notes:         { contains: q } },
          { recoveryEmail: { contains: q } },
        ],
      },
      select: {
        id: true, emailAddress: true, provider: true, status: true, notes: true,
      },
      take: 5,
    }),

    // Cari di SocialAccount (+ parent email)
    prisma.socialAccount.findMany({
      where: {
        deletedAt: null,
        OR: [
          { username: { contains: q } },
          { phone:    { contains: q } },
          { platform: { contains: q } },
          { notes:    { contains: q } },
        ],
      },
      select: {
        id: true, platform: true, username: true, phone: true,
        status: true, notes: true,
        email: { select: { id: true, emailAddress: true, provider: true } },
      },
      take: 10,
    }),
  ]);

  const results: SearchResultItem[] = [
    ...emails.map(e => ({
      type: "email" as const,
      id: e.id,
      emailAddress: e.emailAddress,
      provider: e.provider,
      status: e.status,
      notes: e.notes,
    })),
    ...accounts.map(a => ({
      type: "account" as const,
      id: a.id,
      platform: a.platform,
      username: a.username,
      phone: a.phone,
      status: a.status,
      notes: a.notes,
      parentEmail: a.email,
    })),
  ];

  return NextResponse.json(results);
}
