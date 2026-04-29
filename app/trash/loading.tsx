export default function TrashLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1.5">
            <div className="h-6 w-20 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-40 bg-zinc-800/60 rounded animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-zinc-800 rounded-lg animate-pulse" />
        </div>

        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="bg-zinc-900 px-4 py-3 flex gap-4">
            <div className="h-3 w-28 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-t border-zinc-800 px-4 py-3 flex items-center gap-3">
              <div className="h-5 w-5 bg-zinc-800 rounded animate-pulse" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-zinc-800 rounded animate-pulse" style={{ width: `${40 + (i * 13) % 40}%` }} />
                <div className="h-3 w-24 bg-zinc-800/60 rounded animate-pulse" />
              </div>
              <div className="flex gap-1">
                <div className="h-6 w-16 bg-zinc-800 rounded animate-pulse" />
                <div className="h-6 w-12 bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
