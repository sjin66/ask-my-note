import { useEffect, useRef, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useChatStream } from "@/hooks/useChatStream";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";

export function ChatView() {
  const messages = useChatStore((s) => s.messages);
  const streaming = useChatStore((s) => s.streaming);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const scrollRef = useRef<HTMLDivElement>(null);

  useChatStream();

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Only auto-scroll if user is near the bottom (within 100px)
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, streamingContent, scrollToBottom]);

  if (messages.length === 0 && !streaming) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex max-w-xs flex-col items-center gap-3 text-center">
            <div className="border-border bg-secondary flex size-14 items-center justify-center rounded-xl border">
              <MessageSquare className="text-muted-foreground size-7" />
            </div>
            <div>
              <p className="text-foreground mb-1.5 text-sm font-semibold">Ask about your notes</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                AI will search your notes and provide answers with citations
              </p>
            </div>
          </div>
        </div>
        <ChatInput />
      </div>
    );
  }

  // Find the last message to determine if it's the streaming target
  const lastMessage = messages[messages.length - 1];
  const streamingMessageId =
    streaming && lastMessage?.role === "user" ? "streaming-placeholder" : lastMessage?.id;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isStreaming={false} />
        ))}
        {streaming && (
          <MessageBubble
            key="streaming"
            message={{
              id: streamingMessageId ?? "streaming",
              conversation_id: "",
              role: "assistant",
              content: "",
              created_at: new Date().toISOString(),
            }}
            isStreaming
          />
        )}
      </div>
      <ChatInput />
    </div>
  );
}
