import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TurndownService from "turndown";
import { marked } from "marked";
import { useNoteStore } from "@/stores/noteStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import { MarkdownEditor } from "@/components/notes/MarkdownEditor";
import { MarkdownPreview } from "@/components/notes/MarkdownPreview";
import { NoteEditorToolbar } from "@/components/notes/NoteEditorToolbar";

type EditorMode = "rich-text" | "markdown";

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

/** Convert markdown to HTML for Tiptap. */
function markdownToHtml(md: string): string {
  if (!md.trim()) return "";
  try {
    return marked.parse(md, { async: false }) as string;
  } catch {
    return md;
  }
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
  const [editorMode, setEditorMode] = useState<EditorMode>("rich-text");
  const [showPreview, setShowPreview] = useState(true);

  // Track the previous note ID to detect note switches
  const prevNoteIdRef = useRef<string | null>(null);

  // Tiptap editor instance
  const tiptapEditor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor: e }) => {
      // Convert HTML back to markdown and update shared state
      const md = turndown.turndown(e.getHTML());
      setContent(md);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-stone max-w-none outline-none min-h-[200px] px-10 py-5 text-foreground",
      },
    },
  });

  // Sync editor content when switching notes
  useEffect(() => {
    if (!activeNote) return;
    if (prevNoteIdRef.current === activeNote.id) return;
    prevNoteIdRef.current = activeNote.id;

    const migrated = migrateHtmlToMarkdown(activeNote.content || "", turndown);
    setTitle(activeNote.title);
    setContent(migrated);

    // Update the active editor based on current mode
    if (editorMode === "rich-text" && tiptapEditor) {
      tiptapEditor.commands.setContent(markdownToHtml(migrated));
    } else if (setContentRef.current) {
      setContentRef.current(migrated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNoteId]);

  /** Toggle between rich text and markdown modes. */
  const handleToggleMode = useCallback(() => {
    if (editorMode === "rich-text") {
      // Switching to markdown: content state already has markdown (from tiptap onUpdate)
      setEditorMode("markdown");
    } else {
      // Switching to rich text: convert current markdown to HTML for Tiptap
      if (tiptapEditor) {
        tiptapEditor.commands.setContent(markdownToHtml(content));
      }
      setEditorMode("rich-text");
    }
  }, [editorMode, content, tiptapEditor]);

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

      {/* Toolbar */}
      <NoteEditorToolbar
        editorMode={editorMode}
        showPreview={showPreview}
        onToggleMode={handleToggleMode}
        onTogglePreview={() => setShowPreview(!showPreview)}
      />

      {/* Editor area */}
      {editorMode === "rich-text" ? (
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={tiptapEditor} />
        </div>
      ) : (
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
      )}
    </div>
  );
}
