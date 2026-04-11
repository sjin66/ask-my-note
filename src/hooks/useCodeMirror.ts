import { useEffect, useRef, useCallback } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  foldGutter,
  indentOnInput,
} from "@codemirror/language";
import { editorTheme } from "@/lib/codemirror-theme";

type UseCodeMirrorOptions = {
  /** Initial content for the editor. */
  initialContent: string;
  /** Called on every content change with the full document text. */
  onChange: (content: string) => void;
};

/**
 * React hook that manages a CodeMirror 6 editor instance.
 * Creates the editor on mount, cleans up on unmount, and exposes the view for imperative updates.
 */
export function useCodeMirror({ initialContent, onChange }: UseCodeMirrorOptions) {
  const parentRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  /** Update editor content without triggering onChange. */
  const setContent = useCallback((content: string) => {
    const view = viewRef.current;
    if (!view) return;

    const currentContent = view.state.doc.toString();
    if (currentContent === content) return;

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content },
    });
  }, []);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: initialContent,
      extensions: [
        editorTheme,
        markdown({ base: markdownLanguage }),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        foldGutter(),
        indentOnInput(),
        updateListener,
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only create the editor once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { parentRef, viewRef, setContent };
}
