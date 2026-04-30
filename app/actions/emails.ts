"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, encryptOptional, decryptOptional } from "@/lib/crypto";
import { getSession, isPinSessionActive } from "@/lib/session";

export type RevealEmailResult =
  | { error: string }
  | { password: string; recoveryEmail: string | null };

export type EmailFormState = { error: string } | { success: true } | null;

// ---------------------------------------------------------------------------
// Tambah email baru
// ---------------------------------------------------------------------------
export async function createEmailAction(
  _prev: EmailFormState,
  formData: FormData
): Promise<EmailFormState> {
  const session = await getSession();
  if (!session.isLoggedIn) return { error: "Unauthorized" };

  const emailAddress = (formData.get("emailAddress") as string)?.trim();
  const password = formData.get("password") as string;
  const provider = (formData.get("provider") as string)?.trim();
  const recoveryEmail = (formData.get("recoveryEmail") as string)?.trim() || null;
  const proxy = (formData.get("proxy") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!emailAddress || !password || !provider) {
    return { error: "Email, password, dan provider wajib diisi." };
  }

  const existing = await prisma.emailAccount.findFirst({
    where: { emailAddress, deletedAt: null },
  });
  if (existing) {
    return { error: "Email sudah terdaftar." };
  }

  await prisma.emailAccount.create({
    data: {
      emailAddress,
      password: encrypt(password),
      provider,
      recoveryEmail: encryptOptional(recoveryEmail),
      proxy,
      notes,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Edit email
// ---------------------------------------------------------------------------
export async function updateEmailAction(
  _prev: EmailFormState,
  formData: FormData
): Promise<EmailFormState> {
  const session = await getSession();
  if (!session.isLoggedIn) return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const emailAddress = (formData.get("emailAddress") as string)?.trim();
  const password = formData.get("password") as string;
  const provider = (formData.get("provider") as string)?.trim();
  const recoveryEmail = (formData.get("recoveryEmail") as string)?.trim() || null;
  const proxy = (formData.get("proxy") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "ACTIVE";
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!id || !emailAddress || !provider) {
    return { error: "Data tidak lengkap." };
  }

  const existing = await prisma.emailAccount.findUnique({ where: { id } });
  if (!existing) return { error: "Email tidak ditemukan." };

  await prisma.emailAccount.update({
    where: { id },
    data: {
      emailAddress,
      // Hanya update password jika diisi
      ...(password ? { password: encrypt(password) } : {}),
      provider,
      recoveryEmail: encryptOptional(recoveryEmail),
      proxy,
      status,
      notes,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Reveal email password — hanya jika PIN session aktif
// ---------------------------------------------------------------------------
export async function revealEmailPasswordAction(id: string): Promise<RevealEmailResult> {
  const session = await getSession();
  if (!session.isLoggedIn) return { error: "Unauthorized" };
  if (!isPinSessionActive(session)) return { error: "PIN_REQUIRED" };

  const email = await prisma.emailAccount.findUnique({ where: { id } });
  if (!email || email.deletedAt) return { error: "Tidak ditemukan." };

  return {
    password: decrypt(email.password),
    recoveryEmail: decryptOptional(email.recoveryEmail),
  };
}

// ---------------------------------------------------------------------------
// Soft delete email
// ---------------------------------------------------------------------------
export async function deleteEmailAction(id: string): Promise<void> {
  const session = await getSession();
  if (!session.isLoggedIn) return;

  await prisma.emailAccount.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/dashboard");
}
