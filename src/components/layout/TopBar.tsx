import { MessageSquare, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppStore } from "@/stores/appStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { activeView, setActiveView } = useAppStore();
  const openSettings = useSettingsStore((s) => s.openSettings);

  return (
    <header className="border-border bg-background flex h-12 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setActiveView("notes")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-150",
            activeView === "notes"
              ? "text-foreground border-foreground border-b-2"
              : "text-muted-foreground hover:text-foreground border-b-2 border-transparent",
          )}
        >
          <FileText className="size-3.5" />
          Notes
        </button>
        <button
          onClick={() => setActiveView("chat")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-150",
            activeView === "chat"
              ? "text-foreground border-foreground border-b-2"
              : "text-muted-foreground hover:text-foreground border-b-2 border-transparent",
          )}
        >
          <MessageSquare className="size-3.5" />
          Chat
        </button>
      </div>

      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-8 transition-colors duration-150"
            onClick={openSettings}
          >
            <Settings className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
    </header>
  );
}
