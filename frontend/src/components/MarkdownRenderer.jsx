import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content }) {
  if (!content) return <p className="text-stone-400 italic font-serif">No report generated.</p>;

  return (
    <div className="prose prose-stone max-w-none prose-headings:tracking-tight prose-headings:text-stone-900 prose-p:text-stone-700 prose-p:leading-relaxed prose-a:text-teal-700 prose-a:decoration-teal-700/30 hover:prose-a:decoration-teal-700 prose-strong:text-stone-900 prose-ul:text-stone-700 prose-li:marker:text-teal-700/50 transition-all font-sans">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-serif font-bold mt-8 mb-6 text-stone-900" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-serif font-semibold mt-8 mb-4 border-b border-stone-200/60 pb-3 text-stone-900" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-6 mb-3 text-stone-800" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-base font-semibold mt-4 mb-2 text-stone-800" {...props} />,
          table: ({node, ...props}) => (
            <div className="overflow-hidden rounded-2xl border border-stone-200/60 my-8 shadow-sm bg-white">
              <table className="w-full text-left text-sm" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="bg-[#F4F2EE] border-b border-stone-200/60" {...props} />,
          th: ({node, ...props}) => <th className="px-5 py-4 font-semibold text-stone-800 whitespace-nowrap" {...props} />,
          td: ({node, ...props}) => <td className="px-5 py-4 border-t border-stone-100 align-top text-stone-600" {...props} />,
          code: ({node, inline, ...props}) => 
            inline ? <code className="bg-stone-200/50 text-teal-800 px-2 py-0.5 rounded-md font-mono text-[13px] font-medium" {...props} /> 
                   : <code className="block bg-[#292524] text-stone-100 p-5 rounded-2xl overflow-x-auto text-sm shadow-inner" {...props} />,
          blockquote: ({node, ...props}) => (
            <blockquote className="border-l-4 border-teal-700/40 bg-stone-100/50 italic px-5 py-3 rounded-r-2xl my-6 text-stone-600" {...props} />
          ),
          ul: ({node, ...props}) => <ul className="space-y-2 my-4 pl-6" {...props} />,
          ol: ({node, ...props}) => <ol className="space-y-2 my-4 pl-6" {...props} />,
          li: ({node, ...props}) => <li className="pl-1" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}