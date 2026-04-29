"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">⚠️</p>
        <h2 className="text-white font-semibold mb-2">Terjadi Kesalahan</h2>
        <p className="text-zinc-400 text-sm mb-6">{error.message || "Sesuatu yang tidak terduga terjadi."}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary hover:opacity-90 text-primary-foreground text-sm rounded-lg transition-opacity"
        >
          Coba Lagi
        </button>
      </div>
    </main>
  );
}
