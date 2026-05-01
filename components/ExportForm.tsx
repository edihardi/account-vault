"use client";

import { useState } from "react";

export default function ExportForm() {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function doExport(endpoint: string, filename: string) {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Export gagal");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setPassword("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Terjadi kesalahan saat export");
    } finally {
      setLoading(false);
    }
  }

  function handleExport(e: React.FormEvent) {
    e.preventDefault();
    const date = new Date().toISOString().slice(0, 10);
    doExport("/api/export", `account-vault-${date}.avbak`);
  }

  function handleExportJson(e: React.FormEvent) {
    e.preventDefault();
    const date = new Date().toISOString().slice(0, 10);
    doExport("/api/export/json", `account-vault-${date}.json`);
  }

  return (
    <form onSubmit={handleExport} className="space-y-4" noValidate>
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">
          Konfirmasi Master Password
        </label>
        <div className="relative flex items-center">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Masukkan master password..."
            required
            className="w-full pr-10 pl-3 py-2 text-sm bg-muted/30 border border-border rounded-lg
                       text-foreground placeholder:text-muted-foreground/50
                       focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 text-xs text-muted-foreground hover:text-foreground"
          >
            {showPw ? "hide" : "show"}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
      )}
      {success && (
        <p className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
          ✓ Backup berhasil didownload
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !password}
          className="flex-1 py-2 bg-primary hover:opacity-90 disabled:opacity-40 text-primary-foreground
                     text-sm font-medium rounded-lg transition-opacity"
        >
          {loading ? "Mengekspor..." : "Download .avbak"}
        </button>
        <button
          type="button"
          onClick={handleExportJson}
          disabled={loading || !password}
          className="flex-1 py-2 bg-muted hover:bg-muted/80 disabled:opacity-40 text-foreground
                     text-sm font-medium rounded-lg transition-colors border border-border"
        >
          {loading ? "Mengekspor..." : "Download .json"}
        </button>
      </div>

      <p className="text-xs text-muted-foreground/60">
        <code className="font-mono">.avbak</code> — terenkripsi, hanya bisa dibuka lewat Import.<br />
        <code className="font-mono">.json</code> — plain text, bisa dibuka di text editor.
      </p>
    </form>
  );
}
