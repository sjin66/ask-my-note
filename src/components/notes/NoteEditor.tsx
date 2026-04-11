import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import TurndownService from "turndown";
import { useNoteStore } from "@/stores/noteStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import { MarkdownEditor } from "@/components/notes/MarkdownEditor";
import { MarkdownPreview } from "@/components/notes/MarkdownPreview";
import { NoteEditorToolbar } from "@/components/notes/NoteEditorToolbar";

/** Shared Turndown instance configured for GitHub-flavored markdown output. */
function createTurndownService(): TurndownService {
  return new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
}

/** Convert HTML content from the legacy Tiptap editor to markdown. */
function migrateHtmlToMarkdown(html: string, turndown: TurndownService): string {
  const trimmed = html.trimStart();
  if (trimmed.startsWith("<")) {
    try {
      return turndown.turndown(html);
    } catch {
      // Malformed HTML — return as-is so the user can see and fix it
      return html;
    }
  }
  return html;
}

export function NoteEditor() {
  const { notes, activeNoteId, saveNote } = useNoteStore();
  const activeNote = notes.find((n) => n.id === activeNoteId);

  const turndown = useMemo(() => createTurndownService(), []);
  const setContentRef = useRef<((content: string) => void) | null>(null);

  const [title, setTitle] = useState(() => activeNote?.title || "");
  const [content, setContent] = useState(() => {
    if (!activeNote) return "";
    return migrateHtmlToMarkdown(activeNote.content || "", turndown);
  });
  const [showPreview, setShowPreview] = useState(true);

  // Track the previous note ID to detect note switches
  const prevNoteIdRef = useRef<string | null>(null);

  // Sync editor content when switching notes
  useEffect(() => {
    if (!activeNote) return;
    // Only sync on actual note change, not on every render
    if (prevNoteIdRef.current === activeNote.id) return;
    prevNoteIdRef.current = activeNote.id;

    const migrated = migrateHtmlToMarkdown(activeNote.content || "", turndown);
    setTitle(activeNote.title);
    setContent(migrated);

    // Update CodeMirror content imperatively
    if (setContentRef.current) {
      setContentRef.current(migrated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNoteId]);

  const handleSave = useCallback(() => {
    if (!activeNoteId) return;
    saveNote(activeNoteId, title, content);
  }, [activeNoteId, title, content, saveNote]);

  useAutoSave(handleSave, [title, content]);

  if (!activeNote) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Title bar */}
      <div className="border-border border-b px-10 py-5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="placeholder:text-muted-foreground/40 text-foreground w-full border-none bg-transparent text-2xl font-semibold outline-none"
        />
      </div>

      {/* Toolbar with preview toggle */}
      <NoteEditorToolbar
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview(!showPreview)}
      />

      {/* Editor always mounted in the same position to preserve undo/cursor state */}
      <div className="flex min-h-0 flex-1">
        <div className={`${showPreview ? "w-1/2" : "w-full"} h-full overflow-hidden`}>
          <MarkdownEditor
            content={content}
            onChange={setContent}
            setContentRef={(fn) => (setContentRef.current = fn)}
          />
        </div>
        {showPreview && (
          <>
            <div className="bg-border w-px shrink-0" />
            <div className="h-full w-1/2 overflow-hidden">
              <MarkdownPreview content={content} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
