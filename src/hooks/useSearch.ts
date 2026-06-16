import { useState, useEffect, useCallback } from "react";
import type { ContentEntry, SearchResult } from "@/types/content";
import { buildSearchIndex, search } from "@/lib/search";

export function useSearch(entries: ContentEntry[]) {
  const [isIndexed, setIsIndexed] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (entries.length > 0 && !isIndexed) {
      buildSearchIndex(entries);
      setIsIndexed(true);
    }
  }, [entries, isIndexed]);

  const handleSearch = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      if (newQuery.trim()) {
        setResults(search(newQuery));
      } else {
        setResults([]);
      }
    },
    []
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return {
    query,
    results,
    isIndexed,
    search: handleSearch,
    clear: clearSearch,
  };
}
