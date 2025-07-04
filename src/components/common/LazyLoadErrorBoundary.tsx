import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

/**
 * Error boundary specifically designed to handle lazy loading failures
 * and dynamic import errors that can occur during deployment
 */
export class LazyLoadErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyLoadErrorBoundary caught an error:', error, errorInfo);
    
    // Log specific information about dynamic import failures
    if (error.message.includes('Loading chunk') || 
        error.message.includes('Loading CSS chunk') ||
        error.message.includes('Failed to import') ||
        error.message.includes('http://localhost')) {
      console.error('🔥 Dynamic import error detected:', {
        error: error.message,
        componentName: this.props.componentName,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1,
      }));
      
      // Force a page reload if this is likely a chunk loading error
      if (this.state.error?.message.includes('Loading chunk') ||
          this.state.error?.message.includes('http://localhost')) {
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunkError = this.state.error?.message.includes('Loading chunk') ||
                          this.state.error?.message.includes('Failed to import') ||
                          this.state.error?.message.includes('http://localhost');

      return (
        <div className="min-h-screen bg-green-glass flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4">
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200">
                {isChunkError ? (
                  <>
                    <strong>Loading Error</strong>
                    <br />
                    Failed to load application component. This usually happens during deployments.
                  </>
                ) : (
                  <>
                    <strong>Component Error</strong>
                    <br />
                    {this.props.componentName ? 
                      `Failed to load ${this.props.componentName} component.` :
                      'A component failed to load properly.'
                    }
                  </>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {this.state.retryCount < this.maxRetries && (
                <Button 
                  onClick={this.handleRetry}
                  className="w-full bg-green-600 hover:bg-green-500"
                  variant="default"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry ({this.maxRetries - this.state.retryCount} attempts left)
                </Button>
              )}
              
              <Button 
                onClick={this.handleReload}
                className="w-full"
                variant="outline"
              >
                Reload Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-300">
                <summary className="cursor-pointer text-gray-400 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="whitespace-pre-wrap break-words">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      <br /><br />
                      Stack Trace:
                      <br />
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap lazy-loaded components with error boundary
 */
export function withLazyLoadErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return function WrappedComponent(props: P) {
    return (
      <LazyLoadErrorBoundary componentName={componentName}>
        <Component {...props} />
      </LazyLoadErrorBoundary>
    );
  };
}

export default LazyLoadErrorBoundary;
