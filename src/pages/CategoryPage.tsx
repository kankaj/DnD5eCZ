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
