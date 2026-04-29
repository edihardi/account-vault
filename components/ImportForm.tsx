"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
}

export default function ImportForm() {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !password) return;
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("password", password);

      const res = await fetch("/api/import", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Import gagal");
        return;
      }

      setResult(data);
      setPassword("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch {
      setError("Terjadi kesalahan saat import");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleImport} className="space-y-4">
      {/* File picker */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">
          File Backup (.avbak)
        </label>
        <input
          ref={fileRef}
          type="file"
          accept=".avbak"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          required
          className="w-full text-sm text-muted-foreground
                     file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                     file:text-xs file:font-medium file:bg-muted file:text-foreground
                     file:cursor-pointer hover:file:bg-muted/80 file:transition-colors
                     cursor-pointer"
        />
        {file && (
          <p className="text-xs text-muted-foreground/60 mt-1 font-mono truncate">
            {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">
          Master Password (saat file dibuat)
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

      {result && (
        <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5 space-y-0.5">
          <p className="text-emerald-400 font-medium">✓ Import selesai</p>
          <p className="text-muted-foreground">
            {result.imported} email diimpor
            {result.skipped > 0 && `, ${result.skipped} dilewati (sudah ada)`}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !file || !password}
        className="w-full py-2 bg-primary hover:opacity-90 disabled:opacity-40 text-primary-foreground
                   text-sm font-medium rounded-lg transition-opacity"
      >
        {loading ? "Mengimpor..." : "Import Backup"}
      </button>

      <p className="text-xs text-muted-foreground/60">
        Email yang sudah ada di database tidak akan ditimpa.
      </p>
    </form>
  );
}
