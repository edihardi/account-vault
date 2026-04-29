import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { verifyPassword } from "@/lib/hash";
import { encrypt, encryptOptional } from "@/lib/crypto";
import { decryptBackup } from "@/lib/backup";
import type { BackupData } from "@/lib/backup";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Terima multipart form data: file + password
  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Form data tidak valid" }, { status: 400 });
  }

  const password = form.get("password") as string | null;
  const file = form.get("file") as File | null;

  if (!password || !file) {
    return NextResponse.json({ error: "File dan password diperlukan" }, { status: 400 });
  }

  // Verifikasi master password
  const config = await prisma.appConfig.findFirst();
  if (!config) return NextResponse.json({ error: "App belum di-setup" }, { status: 500 });

  const valid = await verifyPassword(password, config.masterPassHash);
  if (!valid) {
    return NextResponse.json({ error: "Password salah" }, { status: 403 });
  }

  // Baca dan dekripsi file backup
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let backup: BackupData;
  try {
    const plaintext = decryptBackup(buffer, password);
    backup = JSON.parse(plaintext);
  } catch {
    return NextResponse.json(
      { error: "File tidak dapat didekripsi. Pastikan password benar dan file tidak corrupt." },
      { status: 400 }
    );
  }

  if (backup.version !== 1 || !Array.isArray(backup.emails)) {
    return NextResponse.json({ error: "Format backup tidak dikenali" }, { status: 400 });
  }

  // Import data — skip email yang sudah ada (berdasarkan emailAddress)
  let imported = 0;
  let skipped = 0;

  for (const emailData of backup.emails) {
    const existing = await prisma.emailAccount.findUnique({
      where: { emailAddress: emailData.emailAddress },
    });

    if (existing) {
      skipped++;
      continue;
    }

    const newEmail = await prisma.emailAccount.create({
      data: {
        emailAddress: emailData.emailAddress,
        password: encrypt(emailData.password),
        provider: emailData.provider,
        recoveryEmail: encryptOptional(emailData.recoveryEmail),
        proxy: emailData.proxy ?? null,
        status: emailData.status,
        notes: emailData.notes ?? null,
      },
    });

    for (const acc of emailData.socialAccounts) {
      await prisma.socialAccount.create({
        data: {
          emailId: newEmail.id,
          platform: acc.platform,
          username: acc.username ?? null,
          phone: acc.phone ?? null,
          password: encryptOptional(acc.password),
          token: encryptOptional(acc.token),
          totpSeed: encryptOptional(acc.totpSeed),
          extraData: acc.extraData ?? null,
          status: acc.status,
          notes: acc.notes ?? null,
        },
      });
    }

    imported++;
  }

  return NextResponse.json({
    ok: true,
    imported,
    skipped,
    total: backup.emails.length,
  });
}
