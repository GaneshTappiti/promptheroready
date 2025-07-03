import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { Copy, Check, ExternalLink, Code, Palette, Smartphone, Monitor, Zap } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';

interface AIResponseProps {
  content: string;
  className?: string;
  showCopyButton?: boolean;
  variant?: 'default' | 'compact' | 'chat' | 'tool-specific';
  title?: string;
  toolType?: 'framer' | 'flutterflow' | 'uizard' | 'cursor' | 'lovable' | 'general';
  showToolButtons?: boolean;
  metadata?: {
    appType?: string;
    uiStyle?: string;
    complexity?: 'simple' | 'medium' | 'complex';
    estimatedTime?: string;
  };
}

const AIResponse: React.FC<AIResponseProps> = ({
  content,
  className,
  showCopyButton = true,
  variant = 'default',
  title,
  toolType = 'general',
  showToolButtons = false,
  metadata
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const { theme } = useTheme();
  const { toast } = useToast();

  const handleCopy = async (text: string = content, label: string = 'Content') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'framer':
        return <Monitor className="h-4 w-4" />;
      case 'flutterflow':
        return <Smartphone className="h-4 w-4" />;
      case 'uizard':
        return <Palette className="h-4 w-4" />;
      case 'cursor':
        return <Code className="h-4 w-4" />;
      case 'lovable':
        return <Zap className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };

  const getToolColor = (tool: string) => {
    switch (tool) {
      case 'framer':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'flutterflow':
        return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'uizard':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'cursor':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'lovable':
        return 'bg-pink-600/20 text-pink-400 border-pink-600/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const baseStyles = {
    default: "prose prose-sm max-w-none dark:prose-invert",
    compact: "prose prose-xs max-w-none dark:prose-invert",
    chat: "prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-headings:my-2"
  };

  return (
    <div className={cn("relative group bg-card border rounded-lg p-4", className)}>
      {(title || metadata || toolType !== 'general') && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <div className="flex items-center gap-3">
            {toolType !== 'general' && getToolIcon(toolType)}
            <div>
              {title && <h4 className="font-semibold text-foreground">{title}</h4>}
              {metadata && (
                <div className="flex items-center gap-2 mt-1">
                  {metadata.appType && (
                    <Badge variant="outline" className="text-xs">
                      {metadata.appType}
                    </Badge>
                  )}
                  {metadata.uiStyle && (
                    <Badge variant="outline" className="text-xs">
                      {metadata.uiStyle}
                    </Badge>
                  )}
                  {metadata.complexity && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        metadata.complexity === 'complex' ? 'bg-red-600/20 text-red-400' :
                        metadata.complexity === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-green-600/20 text-green-400'
                      )}
                    >
                      {metadata.complexity}
                    </Badge>
                  )}
                  {metadata.estimatedTime && (
                    <Badge variant="outline" className="text-xs">
                      ⏱️ {metadata.estimatedTime}
                    </Badge>
                  )}
                  {toolType !== 'general' && (
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getToolColor(toolType))}
                    >
                      {toolType}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {showCopyButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(content, title || 'AI Response')}
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
                  Copy All
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
          onClick={() => handleCopy()}
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
            li: ({ children, ...props }) => (
              <li className="flex items-start text-foreground" {...props}>
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 bg-primary/20 text-primary">
                  •
                </span>
                <div className="flex-1">{children}</div>
              </li>
            ),
            // Enhanced blockquote
            blockquote: ({ children, ...props }) => (
              <blockquote className="my-6 border-l-4 border-primary bg-muted/30 rounded-r-lg" {...props}>
                <div className="p-4">
                  <div className="text-primary text-sm font-medium mb-2">💡 Key Insight</div>
                  {children}
                </div>
              </blockquote>
            ),
            // Enhanced code blocks with syntax highlighting
            code: ({ inline, className, children, ...props }: any) => {
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

      {/* Tool-specific action buttons */}
      {showToolButtons && toolType !== 'general' && (
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(content, `${toolType} prompt`)}
            className={cn("text-xs", getToolColor(toolType))}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy for {toolType}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const urls = {
                framer: 'https://framer.com',
                flutterflow: 'https://flutterflow.io',
                uizard: 'https://uizard.io',
                cursor: 'https://cursor.sh',
                lovable: 'https://lovable.dev'
              };
              window.open(urls[toolType] || `https://${toolType}.com`, '_blank');
            }}
            className="text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open {toolType}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AIResponse;
