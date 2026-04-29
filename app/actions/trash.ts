"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function restoreItemAction(id: string, type: "email" | "account") {
  const session = await getSession();
  if (!session.isLoggedIn) return { error: "Unauthorized" };

  if (type === "email") {
    await prisma.emailAccount.update({ where: { id }, data: { deletedAt: null } });
  } else {
    await prisma.socialAccount.update({ where: { id }, data: { deletedAt: null } });
  }

  revalidatePath("/trash");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function permanentDeleteAction(id: string, type: "email" | "account") {
  const session = await getSession();
  if (!session.isLoggedIn) return { error: "Unauthorized" };

  if (type === "email") {
    // Hapus semua social accounts milik email ini dulu (cascade manual)
    await prisma.socialAccount.deleteMany({ where: { emailId: id } });
    await prisma.emailAccount.delete({ where: { id } });
  } else {
    await prisma.socialAccount.delete({ where: { id } });
  }

  revalidatePath("/trash");
  return { ok: true };
}

export async function emptyTrashAction() {
  const session = await getSession();
  if (!session.isLoggedIn) return { error: "Unauthorized" };

  // Hapus semua social accounts yang ter-delete
  await prisma.socialAccount.deleteMany({ where: { deletedAt: { not: null } } });
  // Hapus semua email yang ter-delete (social accounts miliknya sudah terhapus)
  await prisma.emailAccount.deleteMany({ where: { deletedAt: { not: null } } });

  revalidatePath("/trash");
  return { ok: true };
}
