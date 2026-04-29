import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { encrypt } from "@/lib/crypto";

// ---------------------------------------------------------------------------
// GET /api/accounts?emailId=xxx&platform=xxx
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const emailId = searchParams.get("emailId") ?? undefined;
  const platform = searchParams.get("platform") ?? undefined;

  const accounts = await prisma.socialAccount.findMany({
    where: {
      deletedAt: null,
      ...(emailId ? { emailId } : {}),
      ...(platform ? { platform: { contains: platform } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      platform: true,
      username: true,
      phone: true,
      status: true,
      notes: true,
      emailId: true,
      createdAt: true,
      email: { select: { emailAddress: true } },
    },
  });

  return NextResponse.json(accounts);
}

// ---------------------------------------------------------------------------
// POST /api/accounts — tambah akun baru
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { emailId, platform, username, phone, password, token, totpSeed, extraData, notes } = body;

  if (!emailId || !platform) {
    return NextResponse.json({ error: "emailId dan platform wajib diisi." }, { status: 400 });
  }
  if (!username && !phone) {
    return NextResponse.json({ error: "Username atau nomor telepon wajib diisi." }, { status: 400 });
  }

  const emailExists = await prisma.emailAccount.findUnique({
    where: { id: emailId },
    select: { id: true, deletedAt: true },
  });
  if (!emailExists || emailExists.deletedAt) {
    return NextResponse.json({ error: "Email induk tidak ditemukan." }, { status: 404 });
  }

  const account = await prisma.socialAccount.create({
    data: {
      emailId,
      platform: platform.trim(),
      username: username?.trim() || null,
      phone: phone?.trim() || null,
      password: password ? encrypt(password) : null,
      token: token ? encrypt(token) : null,
      totpSeed: totpSeed ? encrypt(totpSeed) : null,
      extraData: extraData ? encrypt(JSON.stringify(extraData)) : null,
      notes: notes?.trim() || null,
    },
    select: {
      id: true,
      platform: true,
      username: true,
      phone: true,
      status: true,
      notes: true,
      emailId: true,
      createdAt: true,
    },
  });

  return NextResponse.json(account, { status: 201 });
}
