import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TurndownService from "turndown";
import { marked } from "marked";
import { FileCode2, Type, Eye, EyeOff } from "lucide-react";
import { useNoteStore } from "@/stores/noteStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import { MarkdownEditor } from "@/components/notes/MarkdownEditor";
import { MarkdownPreview } from "@/components/notes/MarkdownPreview";
import { Button } from "@/components/ui/button";

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
  const [showPreview, setShowPreview] = useState(false);

  const prevNoteIdRef = useRef<string | null>(null);

  const tiptapEditor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor: e }) => {
      const md = turndown.turndown(e.getHTML());
      setContent(md);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm prose-stone max-w-none outline-none px-16 py-2 text-foreground",
      },
    },
  });

  // Sync content to Tiptap when editor becomes ready
  useEffect(() => {
    if (!tiptapEditor || editorMode !== "rich-text") return;
    const html = markdownToHtml(content);
    tiptapEditor.commands.setContent(html);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiptapEditor]);

  // Sync editor content when switching notes
  useEffect(() => {
    if (!activeNote) return;
    if (prevNoteIdRef.current === activeNote.id) return;
    prevNoteIdRef.current = activeNote.id;

    const migrated = migrateHtmlToMarkdown(activeNote.content || "", turndown);
    setTitle(activeNote.title);
    setContent(migrated);

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
      setEditorMode("markdown");
    } else {
      if (tiptapEditor) {
        tiptapEditor.commands.setContent(markdownToHtml(content));
      }
      setEditorMode("rich-text");
    }
    setShowPreview(false);
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
      {/* Title — inline, minimal, part of the editor flow */}
      <div className="px-16 pt-8 pb-1">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="placeholder:text-muted-foreground/30 text-foreground w-full border-none bg-transparent text-2xl font-bold outline-none"
        />
      </div>

      {/* Floating toolbar — right-aligned, minimal */}
      <div className="flex items-center justify-between px-16 pb-2">
        <p className="text-muted-foreground/50 text-xs">
          {new Date(activeNote.updated_at).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleMode}
            title={editorMode === "rich-text" ? "Switch to markdown" : "Switch to rich text"}
            className="text-muted-foreground/60 hover:text-foreground h-7 w-7"
          >
            {editorMode === "rich-text" ? <FileCode2 size={14} /> : <Type size={14} />}
          </Button>
          {editorMode === "markdown" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPreview(!showPreview)}
              title={showPreview ? "Hide preview" : "Show preview"}
              className="text-muted-foreground/60 hover:text-foreground h-7 w-7"
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            </Button>
          )}
        </div>
      </div>

      {/* Thin divider */}
      <div className="mx-16">
        <div className="bg-border h-px" />
      </div>

      {/* Editor area — single pane by default, full width */}
      {showPreview && editorMode === "markdown" ? (
        <div className="flex min-h-0 flex-1">
          <div className="border-border h-full w-1/2 overflow-hidden border-r">
            <MarkdownEditor
              content={content}
              onChange={setContent}
              setContentRef={(fn) => (setContentRef.current = fn)}
            />
          </div>
          <div className="h-full w-1/2 overflow-hidden">
            <MarkdownPreview content={content} />
          </div>
        </div>
      ) : editorMode === "rich-text" ? (
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={tiptapEditor} />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <MarkdownEditor
            content={content}
            onChange={setContent}
            setContentRef={(fn) => (setContentRef.current = fn)}
          />
        </div>
      )}
    </div>
  );
}
