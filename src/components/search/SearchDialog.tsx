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
import { getCategoryInfo } from "@/lib/content";
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
    {} as Record<string, SearchResult[]>,
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Hledat kouzla, nestvůry, pravidla..."
        onValueChange={onSearch}
      />
      <CommandList>
        <CommandEmpty>Žádné výsledky</CommandEmpty>
        {Object.entries(groupedResults).map(([category, items]) => (
          <CommandGroup key={category} heading={getCategoryInfo(category).name}>
            {items.map((result) => (
              <CommandItem
                key={result.id}
                value={result.title}
                className="items-start py-2"
                onSelect={() => {
                  navigate(`/content/${result.id}`);
                  onOpenChange(false);
                }}
              >
                <Search className="mt-0.5 h-4 w-4" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{result.title}</span>
                  {result.excerpt && (
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-muted-foreground">
                      {result.excerpt}
                    </span>
                  )}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
