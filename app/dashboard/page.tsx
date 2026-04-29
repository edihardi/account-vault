import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/app/actions/auth";
import EmailList from "@/components/EmailList";
import SearchBar from "@/components/SearchBar";

export default async function DashboardPage() {
  const emails = await prisma.emailAccount.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      emailAddress: true,
      provider: true,
      status: true,
      notes: true,
      proxy: true,
      socialAccounts: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          platform: true,
          username: true,
          phone: true,
          status: true,
          notes: true,
          emailId: true,
          // credential fields — encrypted, tidak di-decrypt di sini
          password: true,
          token: true,
          totpSeed: true,
          extraData: true,
        },
      },
    },
  });

  const emailsForList = emails.map(e => ({
    ...e,
    _count: { socialAccounts: e.socialAccounts.length },
  }));

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header — stacks on mobile */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">Account Vault</h1>
              <p className="text-xs text-zinc-500 mt-0.5">{emails.length} email terdaftar</p>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/trash"
                className="text-base text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-800"
                title="Trash"
              >
                🗑️
              </Link>
              <Link
                href="/settings"
                className="text-base text-zinc-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-zinc-800"
                title="Settings"
              >
                ⚙️
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
          {/* Search — full width on its own row for mobile */}
          <SearchBar />
        </div>

        <EmailList emails={emailsForList} />
      </div>
    </main>
  );
}
