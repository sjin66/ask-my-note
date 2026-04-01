import { create } from "zustand";

type View = "notes" | "chat";

type AppStore = {
  activeView: View;
  setActiveView: (view: View) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  activeView: "notes",
  setActiveView: (view) => set({ activeView: view }),
}));
