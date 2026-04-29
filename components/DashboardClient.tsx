"use client";

import { useState, useMemo, useEffect } from "react";
import SearchBar from "./SearchBar";
import EmailList from "./EmailList";
import PlatformView from "./PlatformView";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

interface SocialAccount {
  id: string;
  platform: string;
  username: string | null;
  phone: string | null;
  status: string;
  notes: string | null;
  emailId: string;
  password: string | null;
  token: string | null;
  totpSeed: string | null;
  extraData: string | null;
}

interface EmailRow {
  id: string;
  emailAddress: string;
  provider: string;
  status: string;
  notes: string | null;
  proxy: string | null;
  socialAccounts: SocialAccount[];
  _count: { socialAccounts: number };
}

interface Props {
  emails: EmailRow[];
}

const PLATFORM_ICONS: Record<string, string> = {
  discord: "🎮", "x (twitter)": "𝕏", telegram: "✈️",
  instagram: "📸", tiktok: "🎵", facebook: "📘",
  reddit: "🤖", github: "🐙", steam: "🕹️",
  youtube: "▶️", twitch: "💜", spotify: "🎧",
};

export default function DashboardClient({ emails }: Props) {
  const [query, setQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Kumpulkan semua platform unik dari seluruh data, sorted alphabetically
  const platforms = useMemo(() => {
    const set = new Set<string>();
    for (const email of emails) {
      for (const acc of email.socialAccounts) {
        set.add(acc.platform.toLowerCase());
      }
    }
    return Array.from(set).sort();
  }, [emails]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return emails.filter(email => {
      // Filter platform: email lolos jika punya minimal 1 akun dengan platform tsb
      if (platformFilter) {
        const hasPlatform = email.socialAccounts.some(
          acc => acc.platform.toLowerCase() === platformFilter
        );
        if (!hasPlatform) return false;
      }

      // Filter search query
      if (q.length >= 2) {
        return (
          email.emailAddress.toLowerCase().includes(q) ||
          email.provider.toLowerCase().includes(q) ||
          email.notes?.toLowerCase().includes(q) ||
          email.proxy?.toLowerCase().includes(q) ||
          email.socialAccounts.some(acc =>
            acc.platform.toLowerCase().includes(q) ||
            acc.username?.toLowerCase().includes(q) ||
            acc.phone?.toLowerCase().includes(q) ||
            acc.notes?.toLowerCase().includes(q)
          )
        );
      }

      return true;
    });
  }, [emails, query, platformFilter]);

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => { setPage(1); }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const isFiltered = query.trim().length >= 2 || platformFilter !== null;

  return (
    <>
      <SearchBar query={query} onQueryChange={setQuery} />

      {/* Platform filter */}
      {platforms.length > 0 && (
        <>
          {/* Mobile: dropdown — selalu tampil */}
          <div className="md:hidden mt-2.5">
            <select
              value={platformFilter ?? ""}
              onChange={e => setPlatformFilter(e.target.value || null)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-muted/40
                         text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">Semua platform</option>
              {platforms.map(p => (
                <option key={p} value={p}>
                  {PLATFORM_ICONS[p] ?? "🔑"} {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop: chips */}
          <div className="hidden md:flex flex-wrap gap-1.5 mt-2.5">
            <button
              onClick={() => setPlatformFilter(null)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors
                ${platformFilter === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
            >
              Semua
            </button>
            {platforms.map((p, i) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(prev => prev === p ? null : p)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors flex items-center gap-1 animate-slide-right
                  ${platformFilter === p
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="hover-wiggle inline-block">{PLATFORM_ICONS[p] ?? "🔑"}</span>
                <span className="capitalize">{p}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mt-4">
        {platformFilter ? (
          <PlatformView emails={filtered} platform={platformFilter} />
        ) : (
          <>
            {isFiltered && (
              <p className="text-xs text-muted-foreground mb-3">
                {filtered.length === 0
                  ? "Tidak ada hasil"
                  : `${filtered.length} dari ${emails.length} email cocok`}
              </p>
            )}
            <EmailList emails={paginated} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}
