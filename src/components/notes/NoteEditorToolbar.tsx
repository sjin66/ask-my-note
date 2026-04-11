import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";

type NoteEditorToolbarProps = {
  /** Whether the preview pane is visible. */
  showPreview: boolean;
  /** Toggle preview visibility. */
  onTogglePreview: () => void;
};

/** Toolbar with preview toggle above the editor. */
export function NoteEditorToolbar({ showPreview, onTogglePreview }: NoteEditorToolbarProps) {
  return (
    <div className="border-border bg-background flex items-center justify-end border-b px-4 py-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onTogglePreview}
        title={showPreview ? "Hide preview" : "Show preview"}
        className="h-7 w-7"
      >
        {showPreview ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
      </Button>
    </div>
  );
}
