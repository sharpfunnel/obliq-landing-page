import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed text-navy-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-navy-900">{children}</strong>,
          ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-gold-600 underline hover:text-gold-700"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-navy-50 px-1 py-0.5 text-xs text-navy-800">{children}</code>
          ),
          table: ({ children }) => (
            <div className="mb-2 overflow-x-auto last:mb-0">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-navy-200 bg-navy-50 px-2 py-1 text-left font-bold text-navy-900">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border border-navy-200 px-2 py-1">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
