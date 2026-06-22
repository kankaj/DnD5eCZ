import type { ContentEntry, Category, ContentManifest } from "@/types/content";

const CATEGORY_INFO: Record<string, { name: string; description: string }> = {
  bestiar: { name: "Bestiář", description: "Nestvůry a tvorové" },
  "dobrodruhuv-pruvodce": { name: "Dobrodruhův Průvodce", description: "Průvodce pro dobrodruhy" },
  "jeskyne-a-draci": { name: "Jeskyně a Draci", description: "Základní pravidla Jeskyní a draků" },
  "jeskyne-a-draci-doplnky": { name: "Jeskyně a Draci - Doplňky", description: "Doplňující obsah" },
  kouzla: { name: "Kouzla", description: "Seznam kouzel" },
  obory: { name: "Obory", description: "Podtřídy a specializace" },
  povolani: { name: "Povolání", description: "Třídy postav" },
  "prirucka-hrace": { name: "Příručka Hráče", description: "Základní pravidla pro hráče" },
  "pruvodce-pana-jeskyne": { name: "Průvodce Pána Jeskyně", description: "Rady pro Pána jeskyně" },
  tasha: { name: "Tašin Kotlík Všeho", description: "Tasha's Cauldron of Everything" },
  "voluv-pruvodce-netvory": { name: "Volův Průvodce Netvory", description: "Rozšířený bestiář" },
  xanathar: { name: "Xanatharův Průvodce Vším", description: "Xanathar's Guide to Everything" },
};

export function getCategoryInfo(slug: string): { name: string; description: string } {
  return CATEGORY_INFO[slug] || {
    name: formatSlugName(slug),
    description: "",
  };
}

function formatSlugName(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase("cs") + word.slice(1))
    .join(" ");
}

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
    const titleMatch = content.match(/^\s*#{1,2}\s+(.+)$/m);
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
    const info = getCategoryInfo(slug);
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
