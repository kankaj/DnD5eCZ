import { Document } from "flexsearch";
import type { ContentEntry, SearchResult } from "@/types/content";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let searchIndex: Document<any> | null = null;
let entryMap = new Map<string, ContentEntry>();

export function buildSearchIndex(entries: ContentEntry[]) {
  entryMap = new Map(entries.map((e) => [e.id, e]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchIndex = new Document<any>({
    document: {
      id: "id",
      index: ["title", "content"],
    },
    tokenize: "forward",
  });

  for (const entry of entries) {
    searchIndex.add(entry);
  }
}

export function search(query: string, limit = 20): SearchResult[] {
  if (!searchIndex || !query.trim()) return [];

  const results = searchIndex.search(query, { limit });

  const seen = new Set<string>();
  const searchResults: SearchResult[] = [];

  for (const resultGroup of results) {
    for (const id of resultGroup.result) {
      const key = String(id);
      if (seen.has(key)) continue;
      seen.add(key);

      const entry = entryMap.get(key);
      if (!entry) continue;

      searchResults.push({
        id: entry.id,
        title: entry.title,
        category: entry.category,
        excerpt: extractExcerpt(entry.content, query),
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
