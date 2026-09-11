import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content, isDark = false }) {
  if (!content) return <p className="text-neutral-400 italic">No report generated.</p>;

  // Classes for Light Theme
  const lightClasses = {
    wrapper: "prose prose-neutral max-w-none prose-headings:tracking-tight prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-p:leading-relaxed prose-a:text-indigo-600",
    h3: "text-xl font-bold mt-8 mb-4 border-b border-neutral-100 pb-2 text-neutral-900 break-after-avoid",
    h4: "text-lg font-semibold mt-6 mb-3 text-neutral-800 break-after-avoid",
    tableWrapper: "overflow-x-auto rounded-xl border border-neutral-200 my-6 shadow-sm",
    thead: "bg-neutral-50 border-b border-neutral-200",
    tr: "break-inside-avoid",
    th: "px-4 py-3 font-semibold text-neutral-900",
    td: "px-4 py-3 border-t border-neutral-100 align-top text-neutral-800",
    codeInline: "bg-neutral-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-mono text-sm",
    codeBlock: "block bg-neutral-900 text-neutral-50 p-4 rounded-xl overflow-x-auto text-sm"
  };

  // Classes for Dark Theme
  const darkClasses = {
    wrapper: "prose prose-invert max-w-none prose-headings:tracking-tight prose-headings:text-neutral-100 prose-p:text-neutral-300 prose-p:leading-relaxed prose-a:text-indigo-400",
    h3: "text-xl font-bold mt-8 mb-4 border-b border-neutral-700 pb-2 text-neutral-100 break-after-avoid",
    h4: "text-lg font-semibold mt-6 mb-3 text-neutral-200 break-after-avoid",
    tableWrapper: "overflow-x-auto rounded-xl border border-neutral-700 my-6 shadow-sm",
    thead: "bg-neutral-800 border-b border-neutral-700",
    tr: "break-inside-avoid",
    th: "px-4 py-3 font-semibold text-neutral-200",
    td: "px-4 py-3 border-t border-neutral-700 align-top text-neutral-300",
    codeInline: "bg-neutral-800 text-indigo-300 px-1.5 py-0.5 rounded-md font-mono text-sm",
    codeBlock: "block bg-black/50 text-neutral-200 p-4 rounded-xl overflow-x-auto text-sm border border-neutral-800"
  };

  const theme = isDark ? darkClasses : lightClasses;

  return (
    <div className={theme.wrapper}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 break-after-avoid" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-4 break-after-avoid" {...props} />,
          h3: ({node, ...props}) => <h3 className={theme.h3} {...props} />,
          h4: ({node, ...props}) => <h4 className={theme.h4} {...props} />,
          p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
          table: ({node, ...props}) => (
            <div className={theme.tableWrapper}>
              <table className="w-full text-left text-sm" style={{ tableLayout: 'auto', wordWrap: 'break-word' }} {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className={theme.thead} {...props} />,
          tr: ({node, ...props}) => <tr className={theme.tr} {...props} />,
          th: ({node, ...props}) => <th className={theme.th + " text-xs break-words min-w-[80px]"} {...props} />,
          td: ({node, ...props}) => <td className={theme.td + " text-xs break-words min-w-[80px]"} {...props} />,
          code: ({node, inline, ...props}) => 
            inline ? <code className={theme.codeInline} {...props} /> 
                   : <code className={theme.codeBlock} {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}