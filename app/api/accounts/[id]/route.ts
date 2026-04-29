import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isPinSessionActive } from "@/lib/session";
import { encrypt, decryptOptional } from "@/lib/crypto";

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET /api/accounts/:id — detail akun, credential hanya terbuka jika PIN aktif
// ---------------------------------------------------------------------------
export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const account = await prisma.socialAccount.findUnique({
    where: { id },
    include: { email: { select: { emailAddress: true, provider: true } } },
  });

  if (!account || account.deletedAt) {
    return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  }

  const pinActive = isPinSessionActive(session);

  return NextResponse.json({
    ...account,
    password: pinActive ? decryptOptional(account.password) : null,
    token: pinActive ? decryptOptional(account.token) : null,
    totpSeed: pinActive ? decryptOptional(account.totpSeed) : null,
    extraData: pinActive
      ? (() => {
          const raw = decryptOptional(account.extraData);
          if (!raw) return null;
          try { return JSON.parse(raw); } catch { return raw; }
        })()
      : null,
    pinRequired: !pinActive,
  });
}

// ---------------------------------------------------------------------------
// PUT /api/accounts/:id — edit akun
// ---------------------------------------------------------------------------
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.socialAccount.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  }

  const body = await req.json();
  const { platform, username, phone, password, token, totpSeed, extraData, status, notes } = body;

  if (platform !== undefined && !platform.trim()) {
    return NextResponse.json({ error: "Platform tidak boleh kosong." }, { status: 400 });
  }
  if (username !== undefined && !username?.trim() && !phone?.trim()) {
    return NextResponse.json({ error: "Username atau nomor telepon wajib diisi." }, { status: 400 });
  }

  const updated = await prisma.socialAccount.update({
    where: { id },
    data: {
      ...(platform !== undefined ? { platform: platform.trim() } : {}),
      ...(username !== undefined ? { username: username?.trim() || null } : {}),
      ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
      ...(password ? { password: encrypt(password) } : {}),
      ...(token !== undefined ? { token: token ? encrypt(token) : null } : {}),
      ...(totpSeed !== undefined ? { totpSeed: totpSeed ? encrypt(totpSeed) : null } : {}),
      ...(extraData !== undefined
        ? { extraData: extraData ? encrypt(JSON.stringify(extraData)) : null }
        : {}),
      ...(status !== undefined ? { status } : {}),
      ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
    },
    select: {
      id: true,
      platform: true,
      username: true,
      phone: true,
      status: true,
      notes: true,
      emailId: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updated);
}

// ---------------------------------------------------------------------------
// DELETE /api/accounts/:id — soft delete
// ---------------------------------------------------------------------------
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.socialAccount.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  }

  await prisma.socialAccount.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
