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
      index: ["title", "searchTitle", "searchContent"],
    },
    tokenize: "forward",
  });

  for (const entry of entries) {
    searchIndex.add({
      ...entry,
      searchTitle: normalizeSearchText(entry.title),
      searchContent: normalizeSearchText(markdownToSearchText(entry.content)),
    });
  }
}

export function search(query: string, limit = 20): SearchResult[] {
  if (!searchIndex || !query.trim()) return [];

  const normalizedQuery = normalizeSearchText(query);
  const results = searchIndex.search(normalizedQuery, { limit });

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
        excerpt: extractExcerpt(entry.content, normalizedQuery),
        score: 0,
      });
    }
  }

  return searchResults.slice(0, limit);
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function markdownToSearchText(markdown: string): string {
  return markdown
    .replace(/<Monster\s+([^>]+)\/>/g, " $1 ")
    .replace(/(\w+(?:-\w+)*)="([^"]*)"/g, " $2 ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[\s>*-]*\|/gm, "|")
    .replace(/[|*_~>#()[\]{}\\]/g, " ")
    .replaceAll("[", " ")
    .replace(/^-{3,}$/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractExcerpt(content: string, normalizedQuery: string, maxLength = 180): string {
  const matchingLine = findMatchingLine(content, normalizedQuery);

  if (matchingLine) {
    return excerptFromLine(matchingLine, normalizedQuery, maxLength);
  }

  const plainText = markdownToSearchText(content);

  return truncateExcerpt(plainText, maxLength);
}

function findMatchingLine(content: string, normalizedQuery: string): string | undefined {
  return content
    .split(/\r?\n/)
    .map(markdownToSearchText)
    .find((line) => normalizeSearchText(line).includes(normalizedQuery));
}

function excerptFromLine(line: string, normalizedQuery: string, maxLength: number): string {
  if (line.length <= maxLength) return line;

  const normalizedLine = normalizeSearchText(line);
  const index = normalizedLine.indexOf(normalizedQuery);

  if (index === -1) return truncateExcerpt(line, maxLength);

  const contextLength = Math.max(30, Math.floor((maxLength - normalizedQuery.length) / 2));
  const start = Math.max(0, index - contextLength);
  const end = Math.min(line.length, index + normalizedQuery.length + contextLength);
  let excerpt = line.slice(start, end).trim();

  if (start > 0) excerpt = "..." + excerpt;
  if (end < line.length) excerpt = excerpt + "...";

  return excerpt;
}

function truncateExcerpt(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}
