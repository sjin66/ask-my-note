import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownContent } from "@/components/chat/MarkdownContent";

type MarkdownPreviewProps = {
  /** Markdown string to render. */
  content: string;
  /** Ref to the scroll container for synchronized scrolling. */
  scrollRef?: React.RefObject<HTMLDivElement | null>;
};

/** Renders markdown as styled HTML in a scrollable preview pane. */
export function MarkdownPreview({ content, scrollRef }: MarkdownPreviewProps) {
  return (
    <ScrollArea className="h-full">
      <div ref={scrollRef} className="px-8 py-6">
        <MarkdownContent content={content} />
      </div>
    </ScrollArea>
  );
}
