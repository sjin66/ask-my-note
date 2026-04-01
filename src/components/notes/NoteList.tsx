import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNoteStore, type Note } from "@/stores/noteStore";
import { cn } from "@/lib/utils";

export function NoteList() {
  const { notes, activeNoteId, setActiveNoteId, deleteNote } = useNoteStore();

  if (notes.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-0.5">
        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            isActive={note.id === activeNoteId}
            onSelect={() => setActiveNoteId(note.id)}
            onDelete={() => deleteNote(note.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

type NoteItemProps = {
  note: Note;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

function NoteItem({ note, isActive, onSelect, onDelete }: NoteItemProps) {
  const title = note.title || "Untitled";
  const date = new Date(note.updated_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left px-3 py-2 rounded-lg group transition-colors duration-150",
        isActive
          ? "bg-background shadow-sm"
          : "hover:bg-background/60"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={cn(
            "text-sm truncate",
            isActive ? "font-medium text-foreground" : "text-foreground/80"
          )}>
            {title}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">{date}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-muted-foreground hover:text-destructive shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </button>
  );
}
