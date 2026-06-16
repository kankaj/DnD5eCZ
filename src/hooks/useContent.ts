import { useState, useEffect } from "react";
import type { ContentManifest } from "@/types/content";
import { loadContentManifest, getEntriesByCategory, getEntryById } from "@/lib/content";

export function useContent() {
  const [manifest, setManifest] = useState<ContentManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadContentManifest()
      .then((m) => {
        setManifest(m);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
        setLoading(false);
      });
  }, []);

  return {
    categories: manifest?.categories ?? [],
    entries: manifest?.entries ?? [],
    loading,
    error,
    getEntriesByCategory: (category: string) =>
      getEntriesByCategory(manifest?.entries ?? [], category),
    getEntryById: (id: string) => getEntryById(manifest?.entries ?? [], id),
  };
}
