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
      set((s) => {
        const isActive = s.activeConversationId === id;
        return {
          conversations: s.conversations.filter((c) => c.id !== id),
          activeConversationId: isActive ? null : s.activeConversationId,
          messages: isActive ? [] : s.messages,
        };
      });
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
    const conversationId = get().activeConversationId;
    if (!conversationId) return;

    // Optimistically add user message to UI
    const optimisticUserMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
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
      await invoke<Message>("send_message", { conversationId, content });

      // Bail if user switched conversations during the stream
      if (get().activeConversationId !== conversationId) return;

      // Reload messages from DB to get the persisted assistant message + correct IDs
      const messages = await invoke<Message[]>("get_conversation_messages", {
        conversationId,
      });

      // Check again after second await
      if (get().activeConversationId !== conversationId) return;

      set({ messages, streaming: false, streamingContent: "" });

      // Reload conversations to pick up auto-title
      await get().loadConversations();
    } catch (e) {
      console.error("Failed to send message:", e);
      // Only clean up if still on the same conversation
      if (get().activeConversationId !== conversationId) return;
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
    // No-op: streaming lifecycle is fully managed by sendMessage.
    // chat-done fires before invoke resolves, so clearing streaming
    // here would hide the placeholder before the final message loads.
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
