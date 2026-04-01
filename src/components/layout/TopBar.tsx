import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppStore } from "@/stores/appStore";

export function TopBar() {
  const { activeView, setActiveView } = useAppStore();

  return (
    <header className="flex items-center justify-between px-3 h-11 border-b border-border bg-background shrink-0">
      <div className="flex items-center gap-1">
        <Button
          variant={activeView === "notes" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveView("notes")}
          className="text-sm font-medium"
        >
          Notes
        </Button>
        <Button
          variant={activeView === "chat" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveView("chat")}
          className="text-sm font-medium"
        >
          Chat
        </Button>
      </div>

      <Separator orientation="vertical" className="h-5" />

      <Tooltip>
        <TooltipTrigger>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
    </header>
  );
}
