import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import TrashList from "@/components/TrashList";
import type { TrashItem } from "@/app/api/trash/route";

export default async function TrashPage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/login");

  const [emails, accounts] = await Promise.all([
    prisma.emailAccount.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: { id: true, emailAddress: true, provider: true, deletedAt: true },
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

  return (
    <main className="flex-1 bg-background text-foreground p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="text-xl font-bold syntax-function flex items-center gap-2">
              <span className="hover-shake inline-block">🗑️</span> Trash
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Item yang dihapus tersimpan di sini</p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="animate-fade-up delay-100">
          <TrashList items={items} />
        </div>
      </div>
    </main>
  );
}
