import { PanelRightOpen, PanelRightClose, FileCode2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

type EditorMode = "rich-text" | "markdown";

type NoteEditorToolbarProps = {
  /** Current editor mode. */
  editorMode: EditorMode;
  /** Whether the preview pane is visible (markdown mode only). */
  showPreview: boolean;
  /** Toggle between rich text and markdown modes. */
  onToggleMode: () => void;
  /** Toggle preview visibility. */
  onTogglePreview: () => void;
};

/** Toolbar with mode toggle and preview toggle above the editor. */
export function NoteEditorToolbar({
  editorMode,
  showPreview,
  onToggleMode,
  onTogglePreview,
}: NoteEditorToolbarProps) {
  return (
    <div className="border-border bg-background flex items-center justify-end gap-1 border-b px-4 py-1">
      {/* Mode toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMode}
        title={editorMode === "rich-text" ? "Switch to markdown" : "Switch to rich text"}
        className="h-7 w-7"
      >
        {editorMode === "rich-text" ? <FileCode2 size={16} /> : <Type size={16} />}
      </Button>

      {/* Preview toggle — only relevant in markdown mode */}
      {editorMode === "markdown" && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePreview}
          title={showPreview ? "Hide preview" : "Show preview"}
          className="h-7 w-7"
        >
          {showPreview ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </Button>
      )}
    </div>
  );
}
