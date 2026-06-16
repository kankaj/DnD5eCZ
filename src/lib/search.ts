import { Document } from "flexsearch";
import type { ContentEntry, SearchResult } from "@/types/content";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let searchIndex: Document<any> | null = null;
let indexedEntries: ContentEntry[] = [];

export function buildSearchIndex(entries: ContentEntry[]) {
  indexedEntries = entries;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchIndex = new Document<any>({
    document: {
      id: "id",
      index: ["title", "content"],
    },
    tokenize: "forward",
    cache: true,
  });

  for (const entry of entries) {
    searchIndex.add(entry);
  }
}

export function search(query: string, limit = 20): SearchResult[] {
  if (!searchIndex || !query.trim()) return [];

  const results = searchIndex.search(query, {
    limit,
    enrich: true,
  });

  const seen = new Set<string>();
  const searchResults: SearchResult[] = [];

  for (const resultGroup of results) {
    for (const item of resultGroup.result) {
      const entry = item.doc ?? indexedEntries.find((e) => e.id === item.id);
      if (!entry || seen.has(String(item.id))) continue;
      seen.add(String(item.id));

      const excerpt = extractExcerpt(entry.content, query);
      searchResults.push({
        id: entry.id,
        title: entry.title,
        category: entry.category,
        excerpt,
        score: 0,
      });
    }
  }

  return searchResults.slice(0, limit);
}

function extractExcerpt(content: string, query: string, maxLength = 150): string {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerContent.indexOf(lowerQuery);

  if (index === -1) {
    return content.slice(0, maxLength).replace(/[#*_[\]]/g, "") + "...";
  }

  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + query.length + 100);
  let excerpt = content.slice(start, end).replace(/[#*_[\]]/g, "");

  if (start > 0) excerpt = "..." + excerpt;
  if (end < content.length) excerpt = excerpt + "...";

  return excerpt;
}
