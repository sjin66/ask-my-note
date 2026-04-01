import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-border/60 bg-sidebar flex flex-col">
      <div className="p-3 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-sm border-dashed border-border/80 text-muted-foreground hover:text-foreground hover:border-border transition-all duration-150"
        >
          <Plus className="h-4 w-4" />
          New Note
        </Button>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full h-8 pl-8 pr-3 text-sm bg-background/60 border border-border/60 rounded-md outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-1 focus:ring-ring/30 transition-all duration-150"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-10 w-10 rounded-xl bg-secondary/80 flex items-center justify-center mb-3">
              <FileTextIcon className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">No notes yet</p>
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              Create your first note to get started
            </p>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}
