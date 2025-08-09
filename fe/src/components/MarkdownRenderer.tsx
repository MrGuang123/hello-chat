import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <ReactMarkdown
      className={`markdown-content ${className || ''}`}
      remarkPlugins={[remarkGfm]}
      components={{
        // Custom styling for different elements
        h1: ({children}) => <h1 className="markdown-h1">{children}</h1>,
        h2: ({children}) => <h2 className="markdown-h2">{children}</h2>,
        h3: ({children}) => <h3 className="markdown-h3">{children}</h3>,
        p: ({children}) => <p className="markdown-p">{children}</p>,
        code: ({inline, children}: any) => 
          inline ? 
            <code className="markdown-inline-code">{children}</code> : 
            <code className="markdown-code-block">{children}</code>,
        pre: ({children}) => <pre className="markdown-pre">{children}</pre>,
        blockquote: ({children}) => <blockquote className="markdown-blockquote">{children}</blockquote>,
        ul: ({children}) => <ul className="markdown-ul">{children}</ul>,
        ol: ({children}) => <ol className="markdown-ol">{children}</ol>,
        li: ({children}) => <li className="markdown-li">{children}</li>,
        strong: ({children}) => <strong className="markdown-strong">{children}</strong>,
        em: ({children}) => <em className="markdown-em">{children}</em>,
        a: ({href, children}: any) => (
          <a 
            href={href} 
            className="markdown-link" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;