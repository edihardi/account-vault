export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="space-y-1.5">
            <div className="h-6 w-36 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-24 bg-zinc-800/60 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-52 bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-8 w-8 bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-8 w-8 bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-8 w-16 bg-zinc-800 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="bg-zinc-900 px-4 py-3 flex gap-4">
            <div className="h-3 w-8 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-40 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-t border-zinc-800 px-4 py-3.5 flex items-center gap-4">
              <div className="h-4 w-4 bg-zinc-800 rounded animate-pulse flex-shrink-0" />
              <div className="flex items-center gap-2.5 flex-1">
                <div className="h-5 w-5 bg-zinc-800 rounded animate-pulse flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-zinc-800 rounded animate-pulse" style={{ width: `${45 + (i * 11) % 35}%` }} />
                  <div className="h-3 w-16 bg-zinc-800/60 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-14 bg-zinc-800 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex gap-1">
                <div className="h-6 w-12 bg-zinc-800 rounded animate-pulse" />
                <div className="h-6 w-10 bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
