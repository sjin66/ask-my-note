import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_indexed: boolean;
};

type NoteStore = {
  notes: Note[];
  activeNoteId: string | null;
  loading: boolean;

  loadNotes: () => Promise<void>;
  createNote: () => Promise<void>;
  saveNote: (id: string, title: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setActiveNoteId: (id: string | null) => void;
};

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  activeNoteId: null,
  loading: false,

  loadNotes: async () => {
    set({ loading: true });
    try {
      const notes = await invoke<Note[]>("list_notes");
      set({ notes, loading: false });
    } catch (e) {
      console.error("Failed to load notes:", e);
      set({ loading: false });
    }
  },

  createNote: async () => {
    try {
      const note = await invoke<Note>("create_note");
      set((s) => ({
        notes: [note, ...s.notes],
        activeNoteId: note.id,
      }));
    } catch (e) {
      console.error("Failed to create note:", e);
    }
  },

  saveNote: async (id, title, content) => {
    try {
      const updated = await invoke<Note>("save_note", { id, title, content });
      set((s) => ({
        notes: s.notes.map((n) => (n.id === id ? updated : n)),
      }));
    } catch (e) {
      console.error("Failed to save note:", e);
    }
  },

  deleteNote: async (id) => {
    try {
      await invoke<boolean>("delete_note", { id });
      const { activeNoteId } = get();
      set((s) => ({
        notes: s.notes.filter((n) => n.id !== id),
        activeNoteId: activeNoteId === id ? null : activeNoteId,
      }));
    } catch (e) {
      console.error("Failed to delete note:", e);
    }
  },

  setActiveNoteId: (id) => set({ activeNoteId: id }),
}));
