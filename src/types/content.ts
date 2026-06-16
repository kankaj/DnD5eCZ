export interface ContentEntry {
  id: string;
  slug: string;
  title: string;
  category: string;
  sourceBook: string;
  content: string;
  html?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  entryCount: number;
}

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  score: number;
}

export interface ContentManifest {
  categories: Category[];
  entries: ContentEntry[];
}
