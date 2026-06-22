import type { ContentEntry } from "@/types/content";
import { MarkdownRenderer } from "@/components/content/MarkdownRenderer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContentPageProps {
  entry: ContentEntry;
  searchQuery?: string;
}

export function ContentPage({ entry, searchQuery }: ContentPageProps) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <MarkdownRenderer content={entry.content} searchQuery={searchQuery} />
    </ScrollArea>
  );
}
