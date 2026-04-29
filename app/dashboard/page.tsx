import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/app/actions/auth";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const emails = await prisma.emailAccount.findMany({
    where: { deletedAt: null },
    orderBy: { socialAccounts: { _count: "desc" } },
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
    <main className="flex-1 bg-background text-foreground p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4 animate-fade-up">
          <div>
            <h1 className="text-base md:text-xl font-bold leading-tight syntax-function">
              HardiAcc
              <span className="animate-cursor ml-0.5 text-primary">_</span>
            </h1>
            <p className="text-[10px] md:text-xs syntax-number">{emails.length} email</p>
          </div>
          <div className="flex items-center gap-0.5">
            <Link
              href="/trash"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              title="Trash"
            >
              <span className="hover-shake inline-block">🗑️</span>
            </Link>
            <Link
              href="/settings"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              title="Settings"
            >
              <span className="hover-spin inline-block">⚙️</span>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                title="Logout"
              >
                <span className="hover-wiggle inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </span>
              </button>
            </form>
          </div>
        </div>

        <div className="animate-fade-up delay-100">
          <DashboardClient emails={emailsForList} />
        </div>
      </div>
    </main>
  );
}
