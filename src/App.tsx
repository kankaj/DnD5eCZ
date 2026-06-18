import { useState, useEffect } from "react";
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
import type { ContentEntry, Category } from "@/types/content";

function CategoryRoute({
  getEntriesByCategory,
  categories,
}: {
  getEntriesByCategory: (slug: string) => ContentEntry[];
  categories: Category[];
}) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const category = categories.find((c) => c.slug === slug);
  const entries = slug ? getEntriesByCategory(slug) : [];

  if (!category) return <div className="p-4">Kategorie nenalezena</div>;
  return (
    <>
      <TopBar title={category.name} showBack onBack={() => navigate(-1)} />
      <CategoryPage entries={entries} />
    </>
  );
}

function ContentRoute({
  getEntryById,
}: {
  getEntryById: (id: string) => ContentEntry | undefined;
}) {
  const params = useParams<{ '*': string }>();
  const id = params['*'];
  const navigate = useNavigate();
  const entry = id ? getEntryById(id) : undefined;

  if (!entry) return <div className="p-4">Záznam nenalezen</div>;

  return (
    <>
      <TopBar title={entry.title} showBack onBack={() => navigate(-1)} />
      <ContentPage entry={entry} />
    </>
  );
}

function AppContent() {
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
        onSearchChange={() => setSearchOpen(true)}
        onSearchFocus={() => setSearchOpen(true)}
      />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage categories={categories} />} />
          <Route
            path="/category/:slug"
            element={
              <CategoryRoute
                getEntriesByCategory={getEntriesByCategory}
                categories={categories}
              />
            }
          />
          <Route
            path="/content/*"
            element={<ContentRoute getEntryById={getEntryById} />}
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

export default function App() {
  return (
    <MemoryRouter>
      <AppContent />
    </MemoryRouter>
  );
}
