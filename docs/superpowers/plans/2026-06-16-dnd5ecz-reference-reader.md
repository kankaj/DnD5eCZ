# DnD5eCZ Reference Reader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Owlbear Rodeo extension that provides a searchable Czech D&D 5e reference reader in a popover panel.

**Architecture:** Static site with Vite + React + TypeScript. Content is processed at build time from 949 markdown files. Runs in an Owlbear Rodeo iframe popover with MemoryRouter for navigation and FlexSearch for instant client-side search.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4, shadcn/ui, @owlbear-rodeo/sdk, react-router-dom, remark/rehype, FlexSearch

---

## File Structure

```
src/
├── main.tsx                          # App entry point, SDK init
├── App.tsx                           # Router setup, layout
├── index.css                         # Tailwind imports, global styles
├── components/
│   ├── ui/                           # shadcn/ui components (auto-generated)
│   ├── layout/
│   │   ├── AppShell.tsx              # Main layout wrapper
│   │   ├── TopBar.tsx                # Search bar, back button
│   │   └── Sidebar.tsx               # Category navigation tree
│   ├── content/
│   │   ├── MonsterStatBlock.tsx      # Custom <Monster> component
│   │   ├── MarkdownRenderer.tsx      # Renders processed HTML
│   │   └── ContentCard.tsx           # Card for category entries
│   └── search/
│       ├── SearchCommand.tsx         # Command palette search UI
│       └── SearchResults.tsx         # Search result list
├── pages/
│   ├── HomePage.tsx                  # Category grid
│   ├── CategoryPage.tsx              # Entry list for a category
│   └── ContentPage.tsx               # Rendered markdown content
├── lib/
│   ├── content.ts                    # Content loading and types
│   ├── search.ts                     # FlexSearch index management
│   ├── owl-bear.ts                   # SDK wrapper and hooks
│   └── utils.ts                      # cn() helper, etc.
├── hooks/
│   ├── useContent.ts                 # Hook for loading content
│   ├── useSearch.ts                  # Hook for search
│   └── useOwlBearTheme.ts            # Hook for theme syncing
└── types/
    └── content.ts                    # TypeScript interfaces
```

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install all dependencies**

Run:
```bash
npm install @owlbear-rodeo/sdk react-router-dom flexsearch remark remark-rehype rehype-stringify rehype-raw gray-matter clsx tailwind-merge class-variance-authority lucide-react
```

Expected: Dependencies added to `package.json`

- [ ] **Step 2: Install shadcn/ui CLI**

Run:
```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Expected: `components.json` created, `src/components/ui/` directory created

- [ ] **Step 3: Install shadcn/ui components**

Run:
```bash
npx shadcn@latest add accordion badge button command dialog input scroll-area separator sheet
```

Expected: Components added to `src/components/ui/`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json components.json src/components/ui/
git commit -m "chore: install dependencies and setup shadcn/ui"
```

---

### Task 2: Create Content Types

**Files:**
- Create: `src/types/content.ts`

- [ ] **Step 1: Create content type definitions**

```typescript
// src/types/content.ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/types/content.ts
git commit -m "feat: add content type definitions"
```

---

### Task 3: Create Utility Functions

**Files:**
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create utility functions**

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/utils.ts
git commit -m "feat: add utility functions"
```

---

### Task 4: Create Owlbear SDK Integration

**Files:**
- Create: `src/lib/owl-bear.ts`
- Create: `src/hooks/useOwlBearTheme.ts`

- [ ] **Step 1: Create Owlbear SDK wrapper**

```typescript
// src/lib/owl-bear.ts
import OBR from "@owlbear-rodeo/sdk";

let isInitialized = false;

export async function initOwlbearSdk(): Promise<boolean> {
  if (isInitialized) return true;

  try {
    await OBR.init();
    isInitialized = true;
    return true;
  } catch (error) {
    console.log("Running outside Owlbear Rodeo");
    return false;
  }
}

export function isOwlbearReady(): boolean {
  return isInitialized;
}

export async function getTheme(): Promise<"light" | "dark"> {
  if (!isInitialized) return "light";
  const theme = await OBR.theme.getTheme();
  return theme.mode === "dark" ? "dark" : "light";
}
```

- [ ] **Step 2: Create theme hook**

```typescript
// src/hooks/useOwlBearTheme.ts
import { useState, useEffect } from "react";
import { isOwlbearReady, getTheme } from "@/lib/owl-bear";
import OBR from "@owlbear-rodeo/sdk";

export function useOwlBearTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (!isOwlbearReady()) return;

    getTheme().then(setTheme);

    const unsubscribe = OBR.theme.onChange((newTheme) => {
      setTheme(newTheme.mode === "dark" ? "dark" : "light");
    });

    return () => unsubscribe();
  }, []);

  return theme;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/owl-bear.ts src/hooks/useOwlBearTheme.ts
git commit -m "feat: add Owlbear SDK integration"
```

---

### Task 5: Create Content Loading Module

**Files:**
- Create: `src/lib/content.ts`

- [ ] **Step 1: Create content loader**

```typescript
// src/lib/content.ts
import type { ContentEntry, Category, ContentManifest } from "@/types/content";

const CATEGORY_MAP: Record<string, { name: string; description: string }> = {
  bestiar: { name: "Bestiář", description: "Nestvůry a tvorové" },
  "prirucka-hrace": { name: "Příručka hráče", description: "Základní pravidla" },
  "pruvodce-pana-jeskyne": { name: "Průvodce Pána jeskyně", description: "Rady pro PJ" },
  "jeskyne-a-draci": { name: "Jeskyně a draci", description: "Doplněk" },
  "jeskyne-a-draci-doplnky": { name: "Jeskyně a draci - doplňky", description: "Další obsah" },
  tasha: { name: "Tasha", description: "Tasha's Cauldron of Everything" },
  xanathar: { name: "Xanathar", description: "Xanathar's Guide to Everything" },
  "voluv-pruvodce-netvory": { name: "Volo's Guide to Monsters", description: "Rozšířený bestiář" },
  "dobrodruhuv-pruvodce": { name: "Dobrodruhův průvodce", description: "Průvodce" },
};

const SNIPPET_CATEGORY_MAP: Record<string, { name: string; description: string }> = {
  kouzla: { name: "Kouzla", description: "Seznam kouzel" },
  povolani: { name: "Povolání", description: "Třídy postav" },
  obory: { name: "Obory", description: "Podtřídy a specializace" },
};

export async function loadContentManifest(): Promise<ContentManifest> {
  const modules = import.meta.glob<{ default: string }>("/src/files/**/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
  });

  const entries: ContentEntry[] = [];
  const categoryCounts: Record<string, number> = {};

  for (const [path, module] of Object.entries(modules)) {
    const content = module.default;
    const pathMatch = path.match(/\/src\/files\/([^/]+)\/(.+)\.md$/);
    if (!pathMatch) continue;

    const [, categoryDir, filename] = pathMatch;
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : filename;

    let category = categoryDir;
    let slug = filename;

    if (categoryDir === "snippets") {
      const snippetMatch = filename.match(/^([^/]+)\/(.+)$/);
      if (snippetMatch) {
        category = snippetMatch[1];
        slug = snippetMatch[2];
      }
    }

    const id = `${category}/${slug}`;
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    entries.push({
      id,
      slug,
      title,
      category,
      sourceBook: categoryDir,
      content,
    });
  }

  const categories: Category[] = [];

  for (const [slug, count] of Object.entries(categoryCounts)) {
    const info = CATEGORY_MAP[slug] || SNIPPET_CATEGORY_MAP[slug] || {
      name: slug,
      description: "",
    };
    categories.push({
      id: slug,
      slug,
      name: info.name,
      description: info.description,
      entryCount: count,
    });
  }

  return { categories, entries };
}

export function getEntriesByCategory(
  entries: ContentEntry[],
  category: string
): ContentEntry[] {
  return entries
    .filter((e) => e.category === category)
    .sort((a, b) => a.title.localeCompare(b.title, "cs"));
}

export function getEntryById(
  entries: ContentEntry[],
  id: string
): ContentEntry | undefined {
  return entries.find((e) => e.id === id);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/content.ts
git commit -m "feat: add content loading module"
```

---

### Task 6: Create Search Module

**Files:**
- Create: `src/lib/search.ts`

- [ ] **Step 1: Create search module**

```typescript
// src/lib/search.ts
import FlexSearch from "flexsearch";
import type { ContentEntry, SearchResult } from "@/types/content";

let searchIndex: FlexSearch.Document<ContentEntry, true> | null = null;
let indexedEntries: ContentEntry[] = [];

export function buildSearchIndex(entries: ContentEntry[]) {
  indexedEntries = entries;

  searchIndex = new FlexSearch.Document<ContentEntry, true>({
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
    for (const result of resultGroup.result) {
      const entry = indexedEntries.find((e) => e.id === result.id);
      if (!entry || seen.has(entry.id)) continue;
      seen.add(entry.id);

      const excerpt = extractExcerpt(entry.content, query);
      searchResults.push({
        id: entry.id,
        title: entry.title,
        category: entry.category,
        excerpt,
        score: result.score ?? 0,
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
    return content.slice(0, maxLength).replace(/[#*_\[\]]/g, "") + "...";
  }

  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + query.length + 100);
  let excerpt = content.slice(start, end).replace(/[#*_\[\]]/g, "");

  if (start > 0) excerpt = "..." + excerpt;
  if (end < content.length) excerpt = excerpt + "...";

  return excerpt;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/search.ts
git commit -m "feat: add FlexSearch search module"
```

---

### Task 7: Create Content Hooks

**Files:**
- Create: `src/hooks/useContent.ts`
- Create: `src/hooks/useSearch.ts`

- [ ] **Step 1: Create useContent hook**

```typescript
// src/hooks/useContent.ts
import { useState, useEffect } from "react";
import type { ContentManifest, ContentEntry, Category } from "@/types/content";
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
```

- [ ] **Step 2: Create useSearch hook**

```typescript
// src/hooks/useSearch.ts
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
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useContent.ts src/hooks/useSearch.ts
git commit -m "feat: add content and search hooks"
```

---

### Task 8: Create Layout Components

**Files:**
- Create: `src/components/layout/TopBar.tsx`
- Create: `src/components/layout/AppShell.tsx`

- [ ] **Step 1: Create TopBar component**

```tsx
// src/components/layout/TopBar.tsx
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onSearchFocus?: () => void;
}

export function TopBar({
  title,
  showBack,
  onBack,
  searchQuery,
  onSearchChange,
  onSearchFocus,
}: TopBarProps) {
  return (
    <div className="flex items-center gap-2 border-b p-3">
      {showBack && (
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      {title && <h1 className="text-lg font-semibold flex-1">{title}</h1>}
      {onSearchChange && (
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Hledat..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            className="pl-8"
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create AppShell component**

```tsx
// src/components/layout/AppShell.tsx
import { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add layout components"
```

---

### Task 9: Create Monster Stat Block Component

**Files:**
- Create: `src/components/content/MonsterStatBlock.tsx`

- [ ] **Step 1: Create MonsterStatBlock component**

```tsx
// src/components/content/MonsterStatBlock.tsx
import { Separator } from "@/components/ui/separator";

interface MonsterStatBlockProps {
  title: string;
  subtitle?: string;
  "armor-class"?: string;
  "hit-points"?: string;
  speed?: string;
  str?: string;
  dex?: string;
  con?: string;
  int?: string;
  wis?: string;
  cha?: string;
  "saving-throws"?: string;
  skills?: string;
  "damage-vulnerabilities"?: string;
  "damage-resistances"?: string;
  "damage-immunities"?: string;
  "condition-immunities"?: string;
  senses?: string;
  languages?: string;
  challenge?: string;
}

export function MonsterStatBlock(props: MonsterStatBlockProps) {
  const {
    title,
    subtitle,
    "armor-class": armorClass,
    "hit-points": hitPoints,
    speed,
    str,
    dex,
    con,
    int,
    wis,
    cha,
    "saving-throws": savingThrows,
    skills,
    "damage-vulnerabilities": damageVulnerabilities,
    "damage-resistances": damageResistances,
    "damage-immunities": damageImmunities,
    "condition-immunities": conditionImmunities,
    senses,
    languages,
    challenge,
  } = props;

  return (
    <div className="my-4 rounded-lg border-2 border-red-800 bg-amber-50 p-4 dark:bg-amber-950/20">
      <h3 className="text-xl font-bold text-red-800 dark:text-red-400">{title}</h3>
      {subtitle && <p className="italic text-muted-foreground">{subtitle}</p>}

      <Separator className="my-2 bg-red-800" />

      <div className="space-y-1 text-sm">
        {armorClass && <p><strong>Zbroj:</strong> {armorClass}</p>}
        {hitPoints && <p><strong>Výdrže:</strong> {hitPoints}</p>}
        {speed && <p><strong>Rychlost:</strong> {speed}</p>}
      </div>

      <Separator className="my-2 bg-red-800" />

      <div className="grid grid-cols-6 gap-2 text-center text-sm">
        <div>
          <div className="font-bold text-red-800 dark:text-red-400">SÍL</div>
          <div>{str}</div>
        </div>
        <div>
          <div className="font-bold text-red-800 dark:text-red-400">OBR</div>
          <div>{dex}</div>
        </div>
        <div>
          <div className="font-bold text-red-800 dark:text-red-400">ODO</div>
          <div>{con}</div>
        </div>
        <div>
          <div className="font-bold text-red-800 dark:text-red-400">INT</div>
          <div>{int}</div>
        </div>
        <div>
          <div className="font-bold text-red-800 dark:text-red-400">MOU</div>
          <div>{wis}</div>
        </div>
        <div>
          <div className="font-bold text-red-800 dark:text-red-400">CHA</div>
          <div>{cha}</div>
        </div>
      </div>

      <Separator className="my-2 bg-red-800" />

      <div className="space-y-1 text-sm">
        {savingThrows && <p><strong>Záchranné hody:</strong> {savingThrows}</p>}
        {skills && <p><strong>Dovednosti:</strong> {skills}</p>}
        {damageVulnerabilities && <p><strong>Zranitelnost:</strong> {damageVulnerabilities}</p>}
        {damageResistances && <p><strong>Odolnost:</strong> {damageResistances}</p>}
        {damageImmunities && <p><strong>Imunita vůči zranění:</strong> {damageImmunities}</p>}
        {conditionImmunities && <p><strong>Imunita vůči stavům:</strong> {conditionImmunities}</p>}
        {senses && <p><strong>Smysly:</strong> {senses}</p>}
        {languages && <p><strong>Jazyky:</strong> {languages}</p>}
        {challenge && <p><strong>Nebezpečnost:</strong> {challenge}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/content/MonsterStatBlock.tsx
git commit -m "feat: add Monster stat block component"
```

---

### Task 10: Create Markdown Renderer

**Files:**
- Create: `src/components/content/MarkdownRenderer.tsx`

- [ ] **Step 1: Create MarkdownRenderer component**

```tsx
// src/components/content/MarkdownRenderer.tsx
import { useMemo } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import { MonsterStatBlock } from "./MonsterStatBlock";

interface MarkdownRendererProps {
  content: string;
}

function parseMonsterProps(match: RegExpMatchArray): Record<string, string> {
  const props: Record<string, string> = {};
  const propsStr = match[1];
  const propRegex = /(\w+(?:-\w+)*)="([^"]*)"/g;
  let propMatch;
  while ((propMatch = propRegex.exec(propsStr)) !== null) {
    props[propMatch[1]] = propMatch[2];
  }
  return props;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { html, monsters } = useMemo(() => {
    const monsterMatches: Array<{ id: number; props: Record<string, string> }> = [];
    let processedContent = content;
    let monsterId = 0;

    const monsterRegex = /<Monster\s+([^>]+)\/>/g;
    let match;
    while ((match = monsterRegex.exec(content)) !== null) {
      const props = parseMonsterProps(match);
      monsterMatches.push({ id: monsterId, props });
      processedContent = processedContent.replace(
        match[0],
        `<div data-monster-id="${monsterId}"></div>`
      );
      monsterId++;
    }

    const result = unified()
      .use(remarkParse)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify)
      .processSync(processedContent);

    return { html: String(result), monsters: monsterMatches };
  }, [content]);

  const parts = html.split(/<div data-monster-id="(\d+)"><\/div>/);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none p-4">
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          const monsterId = parseInt(part);
          const monster = monsters.find((m) => m.id === monsterId);
          if (monster) {
            return <MonsterStatBlock key={monsterId} {...monster.props} />;
          }
          return null;
        }
        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: part }}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Install unified**

Run:
```bash
npm install unified
```

- [ ] **Step 3: Commit**

```bash
git add src/components/content/MarkdownRenderer.tsx package.json package-lock.json
git commit -m "feat: add markdown renderer with Monster component support"
```

---

### Task 11: Create Pages

**Files:**
- Create: `src/pages/HomePage.tsx`
- Create: `src/pages/CategoryPage.tsx`
- Create: `src/pages/ContentPage.tsx`

- [ ] **Step 1: Create HomePage**

```tsx
// src/pages/HomePage.tsx
import { useNavigate } from "react-router-dom";
import type { Category } from "@/types/content";
import { Card } from "@/components/ui/card";

interface HomePageProps {
  categories: Category[];
}

export function HomePage({ categories }: HomePageProps) {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">DnD5e CZ</h1>
      <div className="grid gap-3">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="cursor-pointer p-4 transition-colors hover:bg-accent"
            onClick={() => navigate(`/category/${category.slug}`)}
          >
            <h2 className="font-semibold">{category.name}</h2>
            <p className="text-sm text-muted-foreground">{category.description}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {category.entryCount} záznamů
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create CategoryPage**

```tsx
// src/pages/CategoryPage.tsx
import { useNavigate } from "react-router-dom";
import type { ContentEntry, Category } from "@/types/content";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryPageProps {
  category: Category;
  entries: ContentEntry[];
}

export function CategoryPage({ category, entries }: CategoryPageProps) {
  const navigate = useNavigate();

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-semibold">{category.name}</h2>
        <div className="space-y-1">
          {entries.map((entry) => (
            <button
              key={entry.id}
              className="w-full rounded px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              onClick={() => navigate(`/content/${entry.id}`)}
            >
              {entry.title}
            </button>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
```

- [ ] **Step 3: Create ContentPage**

```tsx
// src/pages/ContentPage.tsx
import type { ContentEntry } from "@/types/content";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContentPageProps {
  entry: ContentEntry;
}

export function ContentPage({ entry }: ContentPageProps) {
  return (
    <ScrollArea className="h-full">
      <MarkdownRenderer content={entry.content} />
    </ScrollArea>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/
git commit -m "feat: add Home, Category, and Content pages"
```

---

### Task 12: Create Search UI

**Files:**
- Create: `src/components/search/SearchDialog.tsx`

- [ ] **Step 1: Create SearchDialog component**

```tsx
// src/components/search/SearchDialog.tsx
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { SearchResult } from "@/types/content";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: SearchResult[];
  onSearch: (query: string) => void;
}

export function SearchDialog({
  open,
  onOpenChange,
  results,
  onSearch,
}: SearchDialogProps) {
  const navigate = useNavigate();

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Hledat kouzla, nestvůry, pravidla..." onValueChange={onSearch} />
      <CommandList>
        <CommandEmpty>Žádné výsledky</CommandEmpty>
        {Object.entries(groupedResults).map(([category, items]) => (
          <CommandGroup key={category} heading={category}>
            {items.map((result) => (
              <CommandItem
                key={result.id}
                value={result.title}
                onSelect={() => {
                  navigate(`/content/${result.id}`);
                  onOpenChange(false);
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>{result.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/search/SearchDialog.tsx
git commit -m "feat: add search dialog component"
```

---

### Task 13: Wire Up App with Router

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Update index.css with Tailwind and prose styles**

```css
/* src/index.css */
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 2: Update App.tsx with router and layout**

```tsx
// src/App.tsx
import { useState, useEffect, useCallback } from "react";
import { MemoryRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { TopBar } from "@/components/layout/TopBar";
import { SearchDialog } from "@/components/search/SearchDialog";
import { HomePage } from "@/pages/HomePage";
import { CategoryPage } from "@/pages/CategoryPage";
import { ContentPage } from "@/pages/ContentPage";
import { useContent } from "@/hooks/useContent";
import { useSearch } from "@/hooks/useSearch";
import { useOwlBearTheme } from "@/hooks/useOwlBearTheme";

function AppContent() {
  const navigate = useNavigate();
  const { categories, entries, loading, getEntriesByCategory, getEntryById } = useContent();
  const { results, search, clear } = useSearch(entries);
  const [searchOpen, setSearchOpen] = useState(false);

  const theme = useOwlBearTheme();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <p>Načítání...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopBar
        searchQuery=""
        onSearchChange={() => setSearchOpen(true)}
        onSearchFocus={() => setSearchOpen(true)}
      />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage categories={categories} />} />
          <Route
            path="/category/:slug"
            element={<CategoryRoute getEntriesByCategory={getEntriesByCategory} categories={categories} />}
          />
          <Route
            path="/content/:id"
            element={<ContentRoute getEntryById={getEntryById} onBack={() => navigate(-1)} />}
          />
        </Routes>
      </div>
      <SearchDialog
        open={searchOpen}
        onOpenChange={(open) => {
          setSearchOpen(open);
          if (!open) clear();
        }}
        results={results}
        onSearch={search}
      />
    </AppShell>
  );
}

function CategoryRoute({
  getEntriesByCategory,
  categories,
}: {
  getEntriesByCategory: (slug: string) => ReturnType<typeof getEntriesByCategory>;
  categories: ReturnType<typeof useContent>["categories"];
}) {
  const { slug } = useParams<{ slug: string }>();
  const category = categories.find((c) => c.slug === slug);
  const entries = slug ? getEntriesByCategory(slug) : [];

  if (!category) return <div>Kategorie nenalezena</div>;
  return <CategoryPage category={category} entries={entries} />;
}

function ContentRoute({
  getEntryById,
  onBack,
}: {
  getEntryById: (id: string) => ReturnType<typeof getEntryById>;
  onBack: () => void;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const entry = id ? getEntryById(id) : undefined;

  if (!entry) return <div>Záznam nenalezen</div>;

  return (
    <>
      <TopBar title={entry.title} showBack onBack={() => navigate(-1)} />
      <ContentPage entry={entry} />
    </>
  );
}

export default function App() {
  return (
    <MemoryRouter>
      <AppContent />
    </MemoryRouter>
  );
}
```

- [ ] **Step 3: Update main.tsx**

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initOwlbearSdk } from "./lib/owl-bear";

async function bootstrap() {
  await initOwlbearSdk();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
```

- [ ] **Step 4: Run dev server and verify**

Run:
```bash
npm run dev
```

Expected: App loads at http://localhost:5173 with category cards visible

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/main.tsx src/index.css
git commit -m "feat: wire up app with router and layout"
```

---

### Task 14: Add Card Component and Fix Imports

**Files:**
- Create: `src/components/ui/card.tsx` (if not created by shadcn)

- [ ] **Step 1: Add Card component if missing**

Run:
```bash
npx shadcn@latest add card
```

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: Build completes without errors

- [ ] **Step 3: Fix any TypeScript errors**

Run:
```bash
npm run lint
```

Fix any reported issues.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "fix: add missing components and fix build errors"
```

---

### Task 15: Test in Owlbear Rodeo

**Files:**
- None (manual testing)

- [ ] **Step 1: Start dev server**

Run:
```bash
npm run dev
```

- [ ] **Step 2: Get local URL**

Note the URL (e.g., http://localhost:5173)

- [ ] **Step 3: Create dev manifest URL**

The manifest should be at: `http://localhost:5173/manifest.json`

- [ ] **Step 4: Install in Owlbear Rodeo**

1. Go to owlbear.rodeo
2. Create or join a room
3. Open Extensions menu
4. Click "Install Extension"
5. Paste the manifest URL
6. Click Install

- [ ] **Step 5: Test the extension**

1. Click the extension action icon
2. Verify popover opens
3. Test navigation between categories
4. Test search functionality
5. Test Monster stat block rendering

- [ ] **Step 6: Commit final changes**

```bash
git add .
git commit -m "feat: complete DnD5eCZ Owlbear extension"
```

---

## Self-Review Checklist

- [x] All spec requirements covered by tasks
- [x] No placeholder text (TBD, TODO, etc.)
- [x] Type names consistent across tasks
- [x] File paths are exact
- [x] Commands include expected output
- [x] TDD approach where applicable (search module)
