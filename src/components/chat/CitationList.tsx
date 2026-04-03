import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useChatStore, type Citation } from "@/stores/chatStore";
import { useNoteStore } from "@/stores/noteStore";
import { useAppStore } from "@/stores/appStore";
import { cn } from "@/lib/utils";

type CitationListProps = {
  messageId: string;
};

export function CitationList({ messageId }: CitationListProps) {
  const [expanded, setExpanded] = useState(false);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const loadCitations = useChatStore((s) => s.loadCitations);
  const notes = useNoteStore((s) => s.notes);
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);
  const setActiveView = useAppStore((s) => s.setActiveView);

  useEffect(() => {
    if (!expanded || loaded) return;
    let cancelled = false;
    loadCitations(messageId).then((result) => {
      if (cancelled) return;
      setCitations(result);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [expanded, loaded, messageId, loadCitations]);

  const handleCitationClick = (noteId: string) => {
    setActiveView("notes");
    setActiveNoteId(noteId);
  };

  if (!loaded && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1 text-xs transition-colors"
      >
        <ChevronDown className="size-3" />
        Show sources
      </button>
    );
  }

  if (citations.length === 0 && loaded) {
    return null;
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
      >
        {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        {citations.length} {citations.length === 1 ? "source" : "sources"}
      </button>

      {expanded && (
        <div className="mt-1.5 space-y-1.5">
          {citations.map((citation) => {
            const note = notes.find((n) => n.id === citation.note_id);
            const title = note?.title || "Deleted note";
            const snippet =
              citation.chunk_content.length > 120
                ? citation.chunk_content.slice(0, 120) + "..."
                : citation.chunk_content;

            return (
              <button
                key={citation.id}
                onClick={() => handleCitationClick(citation.note_id)}
                className={cn(
                  "border-border hover:bg-secondary/50 flex w-full items-start gap-2 rounded-md border p-2 text-left transition-colors",
                )}
              >
                <FileText className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-xs font-medium">{title}</p>
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
                    {snippet}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
