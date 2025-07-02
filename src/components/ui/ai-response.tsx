import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { useTheme } from 'next-themes';

interface AIResponseProps {
  content: string;
  className?: string;
  showCopyButton?: boolean;
  variant?: 'default' | 'compact' | 'chat';
  title?: string;
}

const AIResponse: React.FC<AIResponseProps> = ({
  content,
  className,
  showCopyButton = true,
  variant = 'default',
  title
}) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const baseStyles = {
    default: "prose prose-sm max-w-none dark:prose-invert",
    compact: "prose prose-xs max-w-none dark:prose-invert",
    chat: "prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-headings:my-2"
  };

  return (
    <div className={cn("relative group bg-card border rounded-lg p-4", className)}>
      {title && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h4 className="font-semibold text-foreground">{title}</h4>
          {showCopyButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {!title && showCopyButton && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      )}
      
      <div className={cn(
        baseStyles[variant],
        "ai-response-content",
        // Enhanced prose styles for better readability
        "prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground",
        "prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono",
        "prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0",
        "prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:rounded-r",
        "prose-ul:my-3 prose-ol:my-3 prose-li:my-1",
        "prose-table:border prose-th:border prose-td:border prose-th:bg-muted prose-th:p-3 prose-td:p-3",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
      )}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Enhanced heading components with better styling
            h1: ({ children, ...props }) => (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground border-b-2 border-primary pb-2 mb-2" {...props}>
                  {children}
                </h1>
              </div>
            ),
            h2: ({ children, ...props }) => (
              <h2 className="text-xl font-semibold text-foreground mt-6 mb-3 flex items-center" {...props}>
                <span className="w-1 h-6 bg-primary rounded mr-3"></span>
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 className="text-lg font-medium text-foreground mt-4 mb-2" {...props}>
                {children}
              </h3>
            ),
            p: ({ children, ...props }) => (
              <p className="mb-4 text-foreground leading-relaxed" {...props}>
                {children}
              </p>
            ),
            // Enhanced list styling
            ul: ({ children, ...props }) => (
              <ul className="list-none pl-0 mb-4 space-y-2" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="list-none pl-0 mb-4 space-y-2 counter-reset-item" {...props}>
                {children}
              </ol>
            ),
            li: ({ children, ordered, ...props }) => (
              <li className={cn(
                "flex items-start text-foreground",
                ordered ? "counter-increment-item" : ""
              )} {...props}>
                <span className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5",
                  ordered
                    ? "bg-primary text-primary-foreground counter-item"
                    : "bg-primary/20 text-primary"
                )}>
                  {ordered ? (
                    <span className="counter-item">•</span>
                  ) : (
                    "•"
                  )}
                </span>
                <div className="flex-1">{children}</div>
              </li>
            ),
            // Enhanced blockquote
            blockquote: ({ children, ...props }) => (
              <div className="my-6 border-l-4 border-primary bg-muted/30 rounded-r-lg" {...props}>
                <div className="p-4">
                  <div className="text-primary text-sm font-medium mb-2">💡 Key Insight</div>
                  {children}
                </div>
              </div>
            ),
            // Enhanced code blocks with syntax highlighting
            code: ({ inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';

              if (inline) {
                return (
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono border" {...props}>
                    {children}
                  </code>
                );
              }

              return (
                <div className="my-4 rounded-lg border overflow-hidden">
                  <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {language || 'code'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(String(children))}
                      className="h-6 text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <SyntaxHighlighter
                    style={theme === 'dark' ? oneDark : oneLight}
                    language={language}
                    PreTag="div"
                    className="!m-0 !bg-transparent"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: 'transparent',
                      fontSize: '0.875rem'
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            },
            // Enhanced table styling
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto my-6 rounded-lg border">
                <table className="min-w-full border-collapse" {...props}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children, ...props }) => (
              <th className="border-b bg-muted p-3 text-left font-semibold text-foreground" {...props}>
                {children}
              </th>
            ),
            td: ({ children, ...props }) => (
              <td className="border-b p-3 text-foreground" {...props}>
                {children}
              </td>
            ),
            // Enhanced links
            a: ({ children, href, ...props }) => (
              <a
                href={href}
                className="text-primary hover:underline inline-flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
                <ExternalLink className="h-3 w-3" />
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default AIResponse;
