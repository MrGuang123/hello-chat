import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownRenderer.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// 简单的内容清理函数
const cleanMarkdownContent = (content: string): string => {
  if (!content) return '';
  
  let cleaned = content;
  
  // 1. 修复代码块格式问题
  // 处理 ```pythondef(n no 这种格式
  cleaned = cleaned.replace(/```([a-zA-Z]+)([^`\n]*?)```/g, (match, lang, code) => {
    return `\`\`\`${lang}\n${code.trim()}\n\`\`\``;
  });
  
  // 2. 修复标题格式问题
  // 处理 ##标题 这种格式
  cleaned = cleaned.replace(/##([^#\n]+)/g, '## $1');
  
  // 3. 修复连在一起的数值
  // 处理 F0 =0F1 =1 这种格式
  cleaned = cleaned.replace(/(F\d+\s*=\s*\d+)(F\d+\s*=\s*\d+)/g, '$1\n$2');
  
  // 4. 确保代码块前后有空行
  cleaned = cleaned.replace(/([^\n])\n```/g, '$1\n\n```');
  cleaned = cleaned.replace(/```\n([^\n])/g, '```\n\n$1');
  
  // 5. 修复段落格式
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned;
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  const cleanedContent = cleanMarkdownContent(content);
  
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
        code: ({inline, children, className}: any) => {
          if (inline) {
            return <code className="markdown-inline-code">{children}</code>;
          }
          // 处理代码块
          const language = className ? className.replace('language-', '') : '';
          return (
            <pre className="markdown-pre">
              <code className={`markdown-code-block language-${language}`}>
                {children}
              </code>
            </pre>
          );
        },
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
      {cleanedContent}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;