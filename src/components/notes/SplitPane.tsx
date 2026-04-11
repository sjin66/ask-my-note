import { useState, useRef, useCallback, type ReactNode } from "react";

type SplitPaneProps = {
  /** Exactly two children: left pane and right pane. */
  children: [ReactNode, ReactNode];
  /** Initial split ratio (0–1). Default 0.5. */
  defaultSplit?: number;
  /** Minimum px for each pane. Default 200. */
  minSize?: number;
};

/** Resizable horizontal split pane with a drag handle. */
export function SplitPane({ children, defaultSplit = 0.5, minSize = 200 }: SplitPaneProps) {
  const [split, setSplit] = useState(defaultSplit);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      const minRatio = minSize / rect.width;
      const maxRatio = 1 - minRatio;
      setSplit(Math.max(minRatio, Math.min(maxRatio, ratio)));
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [minSize]);

  const [left, right] = children;

  return (
    <div ref={containerRef} className="flex h-full w-full">
      <div style={{ width: `${split * 100}%` }} className="h-full overflow-hidden">
        {left}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="bg-border hover:bg-muted-foreground/20 flex h-full w-1 shrink-0 cursor-col-resize items-center justify-center transition-colors"
      >
        <div className="bg-muted-foreground/30 h-8 w-0.5 rounded-full" />
      </div>
      <div style={{ width: `${(1 - split) * 100}%` }} className="h-full overflow-hidden">
        {right}
      </div>
    </div>
  );
}
