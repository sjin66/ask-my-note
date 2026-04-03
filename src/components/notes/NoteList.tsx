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
      <div className="flex flex-col gap-1 p-2">
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
        "group w-full rounded-xl px-3 py-3 text-left transition-colors duration-150",
        isActive ? "bg-primary/10 text-foreground" : "hover:bg-background/70",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm leading-snug",
              isActive ? "text-foreground font-semibold" : "text-foreground/80 font-medium",
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "mt-1 text-xs",
              isActive ? "text-muted-foreground" : "text-muted-foreground",
            )}
          >
            {date}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-6 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100",
            "text-muted-foreground hover:text-destructive",
          )}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </button>
  );
}
