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
