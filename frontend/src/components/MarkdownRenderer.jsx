import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content }) {
  if (!content) return <p className="text-neutral-400 italic">No report generated.</p>;

  return (
    <div className="prose prose-neutral max-w-none prose-headings:tracking-tight prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-p:leading-relaxed prose-a:text-indigo-600">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-8 mb-4 border-b border-neutral-100 pb-2" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-lg font-semibold mt-6 mb-3 text-neutral-800" {...props} />,
          table: ({node, ...props}) => (
            <div className="overflow-hidden rounded-xl border border-neutral-200 my-6 shadow-sm">
              <table className="w-full text-left text-sm" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="bg-neutral-50 border-b border-neutral-200" {...props} />,
          th: ({node, ...props}) => <th className="px-4 py-3 font-semibold text-neutral-900" {...props} />,
          td: ({node, ...props}) => <td className="px-4 py-3 border-t border-neutral-100 align-top" {...props} />,
          code: ({node, inline, ...props}) => 
            inline ? <code className="bg-neutral-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-mono text-sm" {...props} /> 
                   : <code className="block bg-neutral-900 text-neutral-50 p-4 rounded-xl overflow-x-auto text-sm" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}