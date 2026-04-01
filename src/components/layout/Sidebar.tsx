import { useEffect } from "react";
import { Plus, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNoteStore } from "@/stores/noteStore";
import { NoteList } from "@/components/notes/NoteList";

export function Sidebar() {
  const { notes, loadNotes, createNote } = useNoteStore();

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <aside className="w-60 shrink-0 border-r border-border/60 bg-sidebar flex flex-col">
      <div className="p-3 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-sm border-dashed border-border/80 text-muted-foreground hover:text-foreground hover:border-border transition-all duration-150"
          onClick={createNote}
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

      {notes.length > 0 ? (
        <NoteList />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="h-10 w-10 rounded-xl bg-secondary/80 flex items-center justify-center mb-3">
            <FileText className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">No notes yet</p>
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Create your first note to get started
          </p>
        </div>
      )}
    </aside>
  );
}
