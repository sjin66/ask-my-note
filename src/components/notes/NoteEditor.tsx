import { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useNoteStore } from "@/stores/noteStore";
import { useAutoSave } from "@/hooks/useAutoSave";

export function NoteEditor() {
  const { notes, activeNoteId, saveNote } = useNoteStore();
  const activeNote = notes.find((n) => n.id === activeNoteId);

  const [title, setTitle] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
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
      if (editor && editor.getHTML() !== activeNote.content) {
        editor.commands.setContent(activeNote.content || "");
      }
    }
  }, [activeNoteId]);

  const handleSave = useCallback(() => {
    if (!activeNoteId || !editor) return;
    const content = editor.getHTML();
    saveNote(activeNoteId, title, content);
  }, [activeNoteId, title, editor]);

  useAutoSave(handleSave, [title, editor?.getHTML()]);

  if (!activeNote || !editor) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 pt-6 pb-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full text-2xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
