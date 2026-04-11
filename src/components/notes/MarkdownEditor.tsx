import { useCodeMirror } from "@/hooks/useCodeMirror";

type MarkdownEditorProps = {
  /** Current markdown content. */
  content: string;
  /** Called when the user edits the content. */
  onChange: (content: string) => void;
  /** Exposes the setContent callback for external updates (e.g., note switching). */
  setContentRef?: (setContent: (content: string) => void) => void;
};

/** CodeMirror-based markdown source editor. */
export function MarkdownEditor({ content, onChange, setContentRef }: MarkdownEditorProps) {
  const { parentRef, setContent } = useCodeMirror({
    initialContent: content,
    onChange,
  });

  // Expose setContent to parent via ref callback
  if (setContentRef) {
    setContentRef(setContent);
  }

  return <div ref={parentRef} className="h-full w-full overflow-hidden" />;
}
