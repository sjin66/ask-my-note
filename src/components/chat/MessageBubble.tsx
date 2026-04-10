import { useChatStore, type Message } from "@/stores/chatStore";
import { CitationList } from "@/components/chat/CitationList";
import { MarkdownContent } from "@/components/chat/MarkdownContent";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: Message;
  isStreaming: boolean;
};

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const streamingContent = useChatStore((s) => s.streamingContent);
  const isUser = message.role === "user";

  const displayContent = isStreaming ? streamingContent : message.content;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-xl px-4 py-3",
          isUser ? "bg-primary text-primary-foreground" : "border-border bg-card border",
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayContent}</p>
        ) : (
          <div className="text-sm">
            <MarkdownContent content={displayContent} />
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-current opacity-70" />
            )}
          </div>
        )}
        {!isUser && !isStreaming && message.content.length > 0 && (
          <CitationList messageId={message.id} />
        )}
      </div>
    </div>
  );
}
