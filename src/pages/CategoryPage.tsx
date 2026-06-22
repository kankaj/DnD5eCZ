import { useNavigate } from "react-router-dom";
import type { ContentEntry } from "@/types/content";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryPageProps {
  entries: ContentEntry[];
}

export function CategoryPage({ entries }: Readonly<CategoryPageProps>) {
  const navigate = useNavigate();

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="p-4">
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
