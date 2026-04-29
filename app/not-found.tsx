import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center bg-background text-foreground p-4">
      <div className="text-center animate-fade-up">
        <p className="text-xs syntax-comment mb-3">// 404 — halaman tidak ditemukan</p>

        <h1 className="text-6xl font-bold syntax-function mb-1">
          404<span className="animate-cursor ml-1 text-primary">_</span>
        </h1>

        <p className="text-sm text-muted-foreground mt-4 mb-8">
          <span className="syntax-keyword">throw</span>{" "}
          <span className="syntax-type">Error</span>
          <span className="text-foreground">(</span>
          <span className="syntax-string">&quot;Page not found&quot;</span>
          <span className="text-foreground">)</span>
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm text-foreground transition-colors"
        >
          <span>←</span>
          <span className="syntax-variable">kembali ke dashboard</span>
        </Link>
      </div>
    </main>
  );
}
