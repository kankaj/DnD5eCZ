import { useState, useCallback } from "react";
import type { ContentEntry, SearchResult } from "@/types/content";
import { buildSearchIndex, search } from "@/lib/search";

export function useSearch(entries: ContentEntry[]) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");

  const handleSearch = useCallback(
    (newQuery: string) => {
      if (entries.length > 0) {
        buildSearchIndex(entries);
      }
      setQuery(newQuery);
      if (newQuery.trim()) {
        setResults(search(newQuery));
      } else {
        setResults([]);
      }
    },
    [entries]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return {
    query,
    results,
    search: handleSearch,
    clear: clearSearch,
  };
}
