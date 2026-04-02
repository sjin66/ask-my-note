import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export type AiProvider = "bigmodel" | "openai";

type SettingsStore = {
  isSettingsOpen: boolean;
  hasApiKey: boolean | null;
  provider: AiProvider;
  saving: boolean;

  openSettings: () => void;
  closeSettings: () => void;
  checkApiKey: () => Promise<void>;
  saveApiKey: (key: string) => Promise<void>;
  deleteApiKey: () => Promise<void>;
  loadProvider: () => Promise<void>;
  saveProvider: (provider: AiProvider) => Promise<void>;
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  isSettingsOpen: false,
  hasApiKey: null,
  provider: "bigmodel",
  saving: false,

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  checkApiKey: async () => {
    try {
      const result = await invoke<boolean>("has_api_key");
      set({ hasApiKey: result });
    } catch (e) {
      console.error("Failed to check API key:", e);
      set({ hasApiKey: false });
    }
  },

  saveApiKey: async (key: string) => {
    set({ saving: true });
    try {
      await invoke("save_api_key", { key });
      set({ hasApiKey: true, saving: false, isSettingsOpen: false });
    } catch (e) {
      set({ saving: false });
      throw e;
    }
  },

  deleteApiKey: async () => {
    try {
      await invoke("delete_api_key");
      set({ hasApiKey: false });
    } catch (e) {
      console.error("Failed to delete API key:", e);
    }
  },

  loadProvider: async () => {
    try {
      const result = await invoke<AiProvider>("get_provider");
      set({ provider: result });
    } catch (e) {
      console.error("Failed to load provider:", e);
    }
  },

  saveProvider: async (provider: AiProvider) => {
    try {
      await invoke("save_provider", { provider });
      set({ provider });
    } catch (e) {
      console.error("Failed to save provider:", e);
      throw e;
    }
  },
}));
