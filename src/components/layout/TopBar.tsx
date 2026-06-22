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
    <div className="flex shrink-0 items-center gap-2 border-b p-3">
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
            readOnly
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => onSearchFocus?.()}
            className="pl-8 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
