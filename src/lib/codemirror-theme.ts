import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

/** Custom CodeMirror theme matching the app's warm stone design system. */
export const editorTheme: Extension = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "14px",
    fontFamily: '"Geist Variable", system-ui, sans-serif',
    lineHeight: "1.6",
    color: "var(--foreground)",
    backgroundColor: "var(--background)",
  },
  ".cm-content": {
    padding: "20px 40px",
    maxWidth: "100%",
    caretColor: "var(--primary)",
  },
  ".cm-cursor": {
    borderLeftColor: "var(--primary)",
    borderLeftWidth: "2px",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "var(--primary) !important",
    opacity: "0.15",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-line": {
    padding: "0",
  },
  ".cm-activeLine": {
    backgroundColor: "transparent",
  },
  ".cm-gutters": {
    display: "none",
  },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "inherit",
  },
  // Markdown syntax highlighting
  ".cm-header-1": {
    fontSize: "20px",
    fontWeight: "600",
    lineHeight: "1.4",
  },
  ".cm-header-2": {
    fontSize: "18px",
    fontWeight: "600",
    lineHeight: "1.4",
  },
  ".cm-header-3": {
    fontSize: "16px",
    fontWeight: "600",
    lineHeight: "1.4",
  },
  ".cm-header-4, .cm-header-5, .cm-header-6": {
    fontWeight: "600",
    lineHeight: "1.4",
  },
  ".cm-strong": {
    fontWeight: "600",
  },
  ".cm-em": {
    fontStyle: "italic",
  },
  ".cm-link": {
    color: "var(--accent)",
    textDecoration: "underline",
  },
  ".cm-url": {
    color: "var(--accent)",
  },
  ".cm-comment": {
    color: "var(--muted-foreground)",
    fontFamily: '"Geist Mono", monospace',
    backgroundColor: "var(--secondary)",
    borderRadius: "3px",
    padding: "1px 4px",
  },
  ".cm-monospace": {
    fontFamily: '"Geist Mono", monospace',
    backgroundColor: "var(--secondary)",
    borderRadius: "3px",
    padding: "1px 4px",
  },
  ".cm-quote-1": {
    color: "var(--muted-foreground)",
    fontStyle: "italic",
    borderLeft: "2px solid var(--border)",
    paddingLeft: "12px",
  },
  ".cm-hr": {
    borderColor: "var(--border)",
  },
  ".cm-strikethrough": {
    textDecoration: "line-through",
    color: "var(--muted-foreground)",
  },
});
