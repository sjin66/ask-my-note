import { MessageSquare, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { activeView, setActiveView } = useAppStore();

  return (
    <header className="flex items-center justify-between px-4 h-12 border-b border-border/60 bg-background/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-0.5 bg-secondary/60 rounded-lg p-0.5">
        <button
          onClick={() => setActiveView("notes")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
            activeView === "notes"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          Notes
        </button>
        <button
          onClick={() => setActiveView("chat")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
            activeView === "chat"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chat
        </button>
      </div>

      <Tooltip>
        <TooltipTrigger>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors duration-150">
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
    </header>
  );
}
