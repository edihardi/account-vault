"use client";

import { useRouter } from "next/navigation";
import type { SearchResultItem } from "@/app/api/search/route";

const PLATFORM_ICONS: Record<string, string> = {
  discord: "🎮", "x (twitter)": "𝕏", telegram: "✈️",
  instagram: "📸", tiktok: "🎵", facebook: "📘",
  reddit: "🤖", github: "🐙", steam: "🕹️",
  youtube: "▶️", twitch: "💜", spotify: "🎧",
};

function getPlatformIcon(p: string) {
  return PLATFORM_ICONS[p.toLowerCase()] ?? "🔑";
}

interface Props {
  results: SearchResultItem[];
  loading: boolean;
  query: string;
  onClose: () => void;
}

export default function SearchResults({ results, loading, query, onClose }: Props) {
  const router = useRouter();

  function handleNavigate(item: SearchResultItem) {
    // Navigasi ke dashboard — scroll ke elemen (best effort via hash)
    onClose();
    router.push(`/dashboard#${item.id}`);
  }

  return (
    <div className="absolute top-full mt-1.5 left-0 right-0 z-50
                    bg-card border border-border rounded-xl shadow-lg overflow-hidden
                    max-h-80 overflow-y-auto">
      {loading && results.length === 0 ? (
        <div className="px-4 py-3 text-xs text-muted-foreground">Mencari...</div>
      ) : results.length === 0 ? (
        <div className="px-4 py-3 text-xs text-muted-foreground">
          Tidak ada hasil untuk &ldquo;<span className="text-foreground">{query}</span>&rdquo;
        </div>
      ) : (
        <ul>
          {results.map(item => (
            <li key={`${item.type}-${item.id}`}>
              <button
                onClick={() => handleNavigate(item)}
                className="w-full text-left px-4 py-2.5 hover:bg-muted/40 transition-colors
                           border-b border-border/50 last:border-0 flex items-start gap-3"
              >
                {item.type === "email" ? (
                  <>
                    <span className="text-base mt-0.5 flex-shrink-0">📧</span>
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-medium text-foreground truncate">
                        {item.emailAddress}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.provider}</p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground/60 italic truncate">{item.notes}</p>
                      )}
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground/40 flex-shrink-0 mt-0.5">email</span>
                  </>
                ) : (
                  <>
                    <span className="text-base mt-0.5 flex-shrink-0">{getPlatformIcon(item.platform!)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <p className="text-xs font-medium text-foreground">{item.platform}</p>
                        {item.username && (
                          <span className="text-xs text-muted-foreground">@{item.username}</span>
                        )}
                        {item.phone && (
                          <span className="text-xs text-muted-foreground font-mono">{item.phone}</span>
                        )}
                      </div>
                      {item.parentEmail && (
                        <p className="text-xs text-muted-foreground/60 truncate">
                          📧 {item.parentEmail.emailAddress}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-muted-foreground/60 italic truncate">{item.notes}</p>
                      )}
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground/40 flex-shrink-0 mt-0.5">akun</span>
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
