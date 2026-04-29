"use client";

import { useRef, useEffect } from "react";
import { useSearch } from "@/lib/hooks/useSearch";
import SearchResults from "./SearchResults";

export default function SearchBar() {
  const { query, setQuery, results, loading, clear } = useSearch(300);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        clear();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clear]);

  const showDropdown = query.length >= 2;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <span className="absolute left-3 text-muted-foreground text-sm pointer-events-none">
          {loading ? "⏳" : "🔍"}
        </span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Cari email, username, platform..."
          className="w-full pl-9 pr-8 py-1.5 text-sm bg-muted/40 border border-border rounded-lg
                     text-foreground placeholder:text-muted-foreground/60
                     focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary
                     transition-colors"
        />
        {query && (
          <button
            onClick={clear}
            className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && (
        <SearchResults results={results} loading={loading} query={query} onClose={clear} />
      )}
    </div>
  );
}
