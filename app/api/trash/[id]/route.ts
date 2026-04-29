import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST /api/trash/:id?type=email|account  → restore
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const type = req.nextUrl.searchParams.get("type");

  if (type === "email") {
    const item = await prisma.emailAccount.findUnique({ where: { id } });
    if (!item || !item.deletedAt) {
      return NextResponse.json({ error: "Not found in trash" }, { status: 404 });
    }
    await prisma.emailAccount.update({ where: { id }, data: { deletedAt: null } });
    return NextResponse.json({ ok: true });
  }

  if (type === "account") {
    const item = await prisma.socialAccount.findUnique({ where: { id } });
    if (!item || !item.deletedAt) {
      return NextResponse.json({ error: "Not found in trash" }, { status: 404 });
    }
    await prisma.socialAccount.update({ where: { id }, data: { deletedAt: null } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Missing type param" }, { status: 400 });
}

// DELETE /api/trash/:id?type=email|account  → permanent delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const type = req.nextUrl.searchParams.get("type");

  if (type === "email") {
    // Hapus semua social accounts dulu (cascade manual karena SQLite)
    await prisma.socialAccount.deleteMany({ where: { emailId: id } });
    await prisma.emailAccount.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  if (type === "account") {
    await prisma.socialAccount.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Missing type param" }, { status: 400 });
}
