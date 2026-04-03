import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore, type Conversation } from "@/stores/chatStore";
import { cn } from "@/lib/utils";

export function ConversationList() {
  const { conversations, activeConversationId, selectConversation, deleteConversation } =
    useChatStore();

  if (conversations.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-1 p-2">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeConversationId}
            onSelect={() => selectConversation(conv.id)}
            onDelete={() => deleteConversation(conv.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

type ConversationItemProps = {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

function ConversationItem({ conversation, isActive, onSelect, onDelete }: ConversationItemProps) {
  const title = conversation.title || "New chat";
  const date = new Date(conversation.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group w-full rounded-xl px-3 py-3 text-left transition-colors duration-150",
        isActive ? "bg-primary/10 text-foreground" : "hover:bg-background/70",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm leading-snug",
              isActive ? "text-foreground font-semibold" : "text-foreground/80 font-medium",
            )}
          >
            {title}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">{date}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive size-6 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </button>
  );
}
