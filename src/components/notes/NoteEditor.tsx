import { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useNoteStore } from "@/stores/noteStore";
import { useAutoSave } from "@/hooks/useAutoSave";

export function NoteEditor() {
  const { notes, activeNoteId, saveNote } = useNoteStore();
  const activeNote = notes.find((n) => n.id === activeNoteId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor: e }) => {
      setContent(e.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-stone max-w-none outline-none min-h-[200px] px-8 py-4 text-foreground",
      },
    },
  });

  // Sync editor content when switching notes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content || "");
      if (editor && editor.getHTML() !== activeNote.content) {
        editor.commands.setContent(activeNote.content || "");
      }
    }
    // Only re-sync when the active note changes, not on every activeNote/editor reference change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNoteId]);

  const handleSave = useCallback(() => {
    if (!activeNoteId) return;
    saveNote(activeNoteId, title, content);
  }, [activeNoteId, title, content, saveNote]);

  useAutoSave(handleSave, [title, content]);

  if (!activeNote || !editor) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-8 pt-6 pb-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="placeholder:text-muted-foreground/40 text-foreground w-full border-none bg-transparent text-2xl font-semibold outline-none"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
