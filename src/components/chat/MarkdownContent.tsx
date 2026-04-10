import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import markdown from "highlight.js/lib/languages/markdown";
import "highlight.js/styles/github.css";
import { useNoteStore } from "@/stores/noteStore";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown);

type MarkdownContentProps = {
  content: string;
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeHighlight, { hljs }]]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-foreground mt-4 mb-2 text-lg font-semibold">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-foreground mt-3 mb-1.5 text-base font-semibold">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-foreground mt-2 mb-1 text-sm font-semibold">{children}</h3>
        ),
        p: ({ children }) => <p className="mb-2 leading-relaxed last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="text-foreground font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ node: _node, className, children, ...props }) => {
          if (className) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
          return (
            <code
              className="bg-secondary text-foreground rounded px-1.5 py-0.5 font-mono text-xs"
              {...props}
            >
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-secondary/50 my-2 overflow-x-auto rounded-lg p-3 text-xs">
            {children}
          </pre>
        ),
        ul: ({ children }) => <ul className="my-1.5 list-disc space-y-1 pl-4">{children}</ul>,
        ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-1 pl-4">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-muted-foreground/30 text-muted-foreground my-2 border-l-2 pl-3 italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => {
          const setActiveNoteId = useNoteStore.getState().setActiveNoteId;
          const isNoteLink = href && !href.startsWith("http") && !href.startsWith("/");
          if (isNoteLink) {
            return (
              <button
                type="button"
                className="text-primary hover:text-primary/80 underline underline-offset-2"
                onClick={() => setActiveNoteId(href)}
              >
                {children}
              </button>
            );
          }
          return (
            <a
              href={href}
              className="text-primary hover:text-primary/80 underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );
        },
        hr: () => <hr className="border-border my-3" />,
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto">
            <table className="w-full border-collapse text-xs">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-secondary/50">{children}</thead>,
        th: ({ children }) => (
          <th className="border-border border px-3 py-1.5 text-left font-medium">{children}</th>
        ),
        td: ({ children }) => <td className="border-border border px-3 py-1.5">{children}</td>,
      }}
    >
      {content}
    </Markdown>
  );
}
