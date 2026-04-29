"use client";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
}

export default function SearchBar({ query, onQueryChange }: Props) {
  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
        🔍
      </span>
      <input
        type="text"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        placeholder="Cari email, username, platform..."
        className="w-full pl-9 pr-8 py-1.5 text-sm bg-muted/40 border border-border rounded-lg
                   text-foreground placeholder:text-muted-foreground/60
                   focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary
                   transition-colors"
      />
      {query && (
        <button
          onClick={() => onQueryChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );
}
