"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, isValidPin } from "@/lib/hash";
import { getSession } from "@/lib/session";

export type ActionResult = { error: string } | { success: true };

// ---------------------------------------------------------------------------
// Setup (first-run): buat master password + PIN
// ---------------------------------------------------------------------------
export async function setupAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const masterPassword = formData.get("masterPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const pin = formData.get("pin") as string;
  const confirmPin = formData.get("confirmPin") as string;

  if (!masterPassword || masterPassword.length < 8) {
    return { error: "Master password minimal 8 karakter." };
  }
  if (masterPassword !== confirmPassword) {
    return { error: "Konfirmasi master password tidak cocok." };
  }
  if (!isValidPin(pin)) {
    return { error: "PIN harus tepat 6 digit angka." };
  }
  if (pin !== confirmPin) {
    return { error: "Konfirmasi PIN tidak cocok." };
  }

  const existing = await prisma.appConfig.findFirst();
  if (existing) {
    return { error: "Aplikasi sudah dikonfigurasi. Silakan login." };
  }

  const [masterPassHash, pinHash] = await Promise.all([
    hashPassword(masterPassword),
    hashPassword(pin),
  ]);

  await prisma.appConfig.create({
    data: { masterPassHash, pinHash },
  });

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();

  redirect("/dashboard");
}

// ---------------------------------------------------------------------------
// Login: verifikasi master password
// ---------------------------------------------------------------------------
export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const masterPassword = formData.get("masterPassword") as string;

  if (!masterPassword) {
    return { error: "Master password tidak boleh kosong." };
  }

  const config = await prisma.appConfig.findFirst();
  if (!config) {
    return { error: "Aplikasi belum dikonfigurasi." };
  }

  const valid = await verifyPassword(masterPassword, config.masterPassHash);
  if (!valid) {
    return { error: "Master password salah." };
  }

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();

  redirect("/dashboard");
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------
export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}

// ---------------------------------------------------------------------------
// Verifikasi PIN (untuk reveal password)
// ---------------------------------------------------------------------------
export async function verifyPinAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const pin = formData.get("pin") as string;

  if (!isValidPin(pin)) {
    return { error: "PIN harus 6 digit angka." };
  }

  const config = await prisma.appConfig.findFirst();
  if (!config) return { error: "Konfigurasi tidak ditemukan." };

  // Cek lockout
  if (config.pinLockedUntil && config.pinLockedUntil > new Date()) {
    const menit = Math.ceil(
      (config.pinLockedUntil.getTime() - Date.now()) / 60000
    );
    return { error: `Terlalu banyak percobaan. Coba lagi dalam ${menit} menit.` };
  }

  const valid = await verifyPassword(pin, config.pinHash);

  if (!valid) {
    const newFailCount = config.pinFailCount + 1;
    const lockedUntil =
      newFailCount >= 5 ? new Date(Date.now() + 10 * 60 * 1000) : null;

    await prisma.appConfig.update({
      where: { id: config.id },
      data: {
        pinFailCount: newFailCount,
        pinLockedUntil: lockedUntil,
      },
    });

    const sisa = 5 - newFailCount;
    if (sisa <= 0) {
      return { error: "Terlalu banyak percobaan. Akses dikunci 10 menit." };
    }
    return { error: `PIN salah. ${sisa} percobaan tersisa.` };
  }

  // PIN benar — reset counter & set timestamp di session
  await prisma.appConfig.update({
    where: { id: config.id },
    data: { pinFailCount: 0, pinLockedUntil: null },
  });

  const session = await getSession();
  session.pinVerifiedAt = Date.now();
  await session.save();

  return { success: true };
}

// ---------------------------------------------------------------------------
// Reset PIN menggunakan master password
// ---------------------------------------------------------------------------
export async function resetPinAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const masterPassword = formData.get("masterPassword") as string;
  const newPin = formData.get("newPin") as string;
  const confirmPin = formData.get("confirmPin") as string;

  const config = await prisma.appConfig.findFirst();
  if (!config) return { error: "Konfigurasi tidak ditemukan." };

  const valid = await verifyPassword(masterPassword, config.masterPassHash);
  if (!valid) return { error: "Master password salah." };

  if (!isValidPin(newPin)) return { error: "PIN harus tepat 6 digit angka." };
  if (newPin !== confirmPin) return { error: "Konfirmasi PIN tidak cocok." };

  const pinHash = await hashPassword(newPin);
  await prisma.appConfig.update({
    where: { id: config.id },
    data: { pinHash, pinFailCount: 0, pinLockedUntil: null },
  });

  return { success: true };
}
