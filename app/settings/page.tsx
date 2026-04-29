import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ExportForm from "@/components/ExportForm";
import ImportForm from "@/components/ImportForm";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/login");

  return (
    <main className="flex-1 bg-background text-foreground p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="text-xl font-bold syntax-function flex items-center gap-2">
              <span className="hover-spin inline-block">⚙️</span> Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Backup &amp; restore data</p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted"
          >
            ← Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          {/* Export Section */}
          <div className="rounded-xl border border-border bg-card/30 p-5 animate-fade-up delay-100">
            <div className="mb-4">
              <h2 className="text-sm font-semibold syntax-type flex items-center gap-2">
                <span className="hover-wiggle inline-block">📤</span> Export Backup
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download semua data sebagai file terenkripsi
              </p>
            </div>
            <ExportForm />
          </div>

          {/* Import Section */}
          <div className="rounded-xl border border-border bg-card/30 p-5 animate-fade-up delay-200">
            <div className="mb-4">
              <h2 className="text-sm font-semibold syntax-type flex items-center gap-2">
                <span className="hover-wiggle inline-block">📥</span> Import Backup
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pulihkan data dari file backup <code className="font-mono text-xs syntax-string">.avbak</code>
              </p>
            </div>
            <ImportForm />
          </div>

          {/* Info */}
          <div className="rounded-xl border border-border/40 bg-muted/5 p-4 animate-fade-up delay-300">
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              <strong className="syntax-comment">Format backup:</strong> File{" "}
              <code className="font-mono syntax-string">.avbak</code> berisi semua data terenkripsi dengan
              AES-256-GCM menggunakan master password sebagai kunci. File hanya bisa dibuka dengan
              master password yang sama saat export dilakukan.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
