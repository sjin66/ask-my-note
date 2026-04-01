import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-sidebar flex flex-col">
      <div className="p-3">
        <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-sm">
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      <Separator />

      <div className="p-3">
        <Input placeholder="Search notes..." className="h-8 text-sm" />
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto p-2">
        <p className="text-xs text-muted-foreground text-center mt-8 px-4">
          No notes yet. Create your first note to get started.
        </p>
      </div>
    </aside>
  );
}
