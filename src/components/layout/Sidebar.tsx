import { useEffect } from "react";
import { Plus, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNoteStore } from "@/stores/noteStore";
import { NoteList } from "@/components/notes/NoteList";

export function Sidebar() {
  const { notes, loadNotes, createNote } = useNoteStore();

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return (
    <aside className="border-border/60 bg-sidebar flex w-60 shrink-0 flex-col border-r">
      <div className="space-y-2 p-3">
        <Button
          variant="outline"
          size="sm"
          className="border-border/80 text-muted-foreground hover:text-foreground hover:border-border w-full justify-start gap-2 border-dashed text-sm transition-all duration-150"
          onClick={createNote}
        >
          <Plus className="h-4 w-4" />
          New Note
        </Button>

        <div className="relative">
          <Search className="text-muted-foreground/60 absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes..."
            className="bg-background/60 border-border/60 placeholder:text-muted-foreground/50 focus:border-ring focus:ring-ring/30 h-8 w-full rounded-md border pr-3 pl-8 text-sm transition-all duration-150 outline-none focus:ring-1"
          />
        </div>
      </div>

      {notes.length > 0 ? (
        <NoteList />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
          <div className="bg-secondary/80 mb-3 flex h-10 w-10 items-center justify-center rounded-xl">
            <FileText className="text-muted-foreground/60 h-5 w-5" />
          </div>
          <p className="text-muted-foreground mb-1 text-sm font-medium">No notes yet</p>
          <p className="text-muted-foreground/60 text-xs leading-relaxed">
            Create your first note to get started
          </p>
        </div>
      )}
    </aside>
  );
}
