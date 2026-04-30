"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, decryptOptional } from "@/lib/crypto";
import { getSession, isPinSessionActive } from "@/lib/session";

export type AccountFormState = { error: string } | { success: true } | null;

export async function createAccountAction(
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const session = await getSession();
  if (!session.isLoggedIn) return { error: "Unauthorized" };

  const emailId = formData.get("emailId") as string;
  const platform = (formData.get("platform") as string)?.trim();
  const username = (formData.get("username") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const password = formData.get("password") as string;
  const token = formData.get("token") as string;
  const totpSeed = formData.get("totpSeed") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!emailId || !platform) {
    return { error: "Email induk dan platform wajib diisi." };
  }
  if (!username && !phone) {
    return { error: "Username atau nomor telepon wajib diisi." };
  }

  const email = await prisma.emailAccount.findUnique({
    where: { id: emailId },
    select: { id: true, deletedAt: true },
  });
  if (!email || email.deletedAt) {
    return { error: "Email induk tidak ditemukan." };
  }

  await prisma.socialAccount.create({
    data: {
      emailId,
      platform,
      username,
      phone,
      password: password ? encrypt(password) : null,
      token: token ? encrypt(token) : null,
      totpSeed: totpSeed ? encrypt(totpSeed) : null,
      notes,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateAccountAction(
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const session = await getSession();
  if (!session.isLoggedIn) return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const platform = (formData.get("platform") as string)?.trim();
  const username = (formData.get("username") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const password = formData.get("password") as string;
  const token = formData.get("token") as string;
  const totpSeed = formData.get("totpSeed") as string;
  const status = (formData.get("status") as string) || "ACTIVE";
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!id || !platform) return { error: "Data tidak lengkap." };
  if (!username && !phone) return { error: "Username atau nomor telepon wajib diisi." };

  const existing = await prisma.socialAccount.findUnique({ where: { id } });
  if (!existing) return { error: "Akun tidak ditemukan." };

  await prisma.socialAccount.update({
    where: { id },
    data: {
      platform,
      username,
      phone,
      ...(password ? { password: encrypt(password) } : {}),
      ...(token ? { token: encrypt(token) } : token === "" ? { token: null } : {}),
      ...(totpSeed ? { totpSeed: encrypt(totpSeed) } : totpSeed === "" ? { totpSeed: null } : {}),
      status,
      notes,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteAccountAction(id: string): Promise<void> {
  const session = await getSession();
  if (!session.isLoggedIn) return;

  await prisma.socialAccount.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/dashboard");
}

// ---------------------------------------------------------------------------
// Reveal credentials — hanya jika PIN session aktif
// ---------------------------------------------------------------------------
export type RevealResult =
  | { error: string }
  | {
      password: string | null;
      token: string | null;
      totpSeed: string | null;
      extraData: string | null;
    };

export async function revealCredentialsAction(id: string): Promise<RevealResult> {
  const session = await getSession();
  if (!session.isLoggedIn) return { error: "Unauthorized" };
  if (!isPinSessionActive(session)) return { error: "PIN_REQUIRED" };

  const account = await prisma.socialAccount.findUnique({ where: { id } });
  if (!account || account.deletedAt) return { error: "Tidak ditemukan." };

  return {
    password: account.password ? decrypt(account.password) : null,
    token: account.token ? decryptOptional(account.token) : null,
    totpSeed: account.totpSeed ? decryptOptional(account.totpSeed) : null,
    extraData: account.extraData ? decryptOptional(account.extraData) : null,
  };
}
