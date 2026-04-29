"use client";

import { useState, useEffect, useRef } from "react";
import type { SearchResultItem } from "@/app/api/search/route";

export function useSearch(delay = 300) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error();
        const data: SearchResultItem[] = await res.json();
        setResults(data);
      } catch {
        // abort atau error — abaikan
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, delay]);

  function clear() {
    setQuery("");
    setResults([]);
  }

  return { query, setQuery, results, loading, clear };
}
