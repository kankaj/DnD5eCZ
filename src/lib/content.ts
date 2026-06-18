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
