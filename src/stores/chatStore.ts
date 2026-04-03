import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type Citation = {
  id: number;
  message_id: string;
  note_id: string;
  chunk_content: string;
  relevance_score: number;
};

type ChatStore = {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  streaming: boolean;
  streamingContent: string;
  loading: boolean;

  loadConversations: () => Promise<void>;
  createConversation: () => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  appendToken: (token: string) => void;
  finishStream: () => void;
  loadCitations: (messageId: string) => Promise<Citation[]>;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  streaming: false,
  streamingContent: "",
  loading: false,

  loadConversations: async () => {
    try {
      const conversations = await invoke<Conversation[]>("list_conversations");
      set({ conversations });
    } catch (e) {
      console.error("Failed to load conversations:", e);
    }
  },

  createConversation: async () => {
    try {
      const conv = await invoke<Conversation>("create_conversation");
      set((s) => ({
        conversations: [conv, ...s.conversations],
        activeConversationId: conv.id,
        messages: [],
      }));
    } catch (e) {
      console.error("Failed to create conversation:", e);
    }
  },

  deleteConversation: async (id) => {
    try {
      await invoke<boolean>("delete_conversation", { conversationId: id });
      const { activeConversationId } = get();
      set((s) => ({
        conversations: s.conversations.filter((c) => c.id !== id),
        activeConversationId: activeConversationId === id ? null : activeConversationId,
        messages: activeConversationId === id ? [] : s.messages,
      }));
    } catch (e) {
      console.error("Failed to delete conversation:", e);
    }
  },

  selectConversation: async (id) => {
    set({ activeConversationId: id, messages: [], loading: true });
    try {
      const messages = await invoke<Message[]>("get_conversation_messages", {
        conversationId: id,
      });
      set({ messages, loading: false });
    } catch (e) {
      console.error("Failed to load messages:", e);
      set({ loading: false });
    }
  },

  sendMessage: async (content) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;

    // Optimistically add user message to UI
    const optimisticUserMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: activeConversationId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    set((s) => ({
      messages: [...s.messages, optimisticUserMsg],
      streaming: true,
      streamingContent: "",
    }));

    try {
      await invoke<Message>("send_message", {
        conversationId: activeConversationId,
        content,
      });

      // Reload messages from DB to get the persisted assistant message + correct IDs
      const messages = await invoke<Message[]>("get_conversation_messages", {
        conversationId: activeConversationId,
      });
      set({ messages, streaming: false, streamingContent: "" });

      // Reload conversations to pick up auto-title
      get().loadConversations();
    } catch (e) {
      console.error("Failed to send message:", e);
      // Remove optimistic user message on failure
      set((s) => ({
        messages: s.messages.filter((m) => m.id !== optimisticUserMsg.id),
        streaming: false,
        streamingContent: "",
      }));
    }
  },

  appendToken: (token) => {
    set((s) => ({ streamingContent: s.streamingContent + token }));
  },

  finishStream: () => {
    set({ streaming: false });
  },

  loadCitations: async (messageId) => {
    try {
      return await invoke<Citation[]>("get_message_citations", { messageId });
    } catch (e) {
      console.error("Failed to load citations:", e);
      return [];
    }
  },
}));
