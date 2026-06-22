import { useNavigate } from "react-router-dom";
import type { Category } from "@/types/content";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HomePageProps {
  categories: Category[];
}

export function HomePage({ categories }: HomePageProps) {
  const navigate = useNavigate();

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="p-4">
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
    </ScrollArea>
  );
}
