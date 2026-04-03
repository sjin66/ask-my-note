import { useState, useRef, useCallback } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/chatStore";

export function ChatInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const streaming = useChatStore((s) => s.streaming);

  const canSend = input.trim().length > 0 && !streaming;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    sendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [canSend, input, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-grow textarea
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="border-border bg-background border-t p-4">
      <div className="border-border bg-card flex items-end gap-2 rounded-lg border p-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your notes..."
          rows={1}
          className="text-foreground placeholder:text-muted-foreground max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
          disabled={streaming}
        />
        <Button size="icon" className="size-8 shrink-0" onClick={handleSend} disabled={!canSend}>
          <SendHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  );
}
