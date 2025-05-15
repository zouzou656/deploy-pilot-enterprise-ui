
import React, { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface TerminalConsoleProps {
  logs: string[];
  className?: string;
  title?: string;
  isLoading?: boolean;
  autoScroll?: boolean;
}

const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  logs,
  className = '',
  title = 'Terminal',
  isLoading = false,
  autoScroll = true,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [showCursor, setShowCursor] = useState(true);

  // Parse and style log message
  const parseLogMessage = (message: string) => {
    // Colorize specific patterns
    if (message.includes('SUCCESS') || message.includes('COMPLETED')) {
      return <span className="terminal-success">{message}</span>;
    } else if (message.includes('ERROR') || message.includes('FAILED')) {
      return <span className="terminal-error">{message}</span>;
    } else if (message.includes('WARNING')) {
      return <span className="terminal-warning">{message}</span>;
    } else if (message.startsWith('$') || message.startsWith('>')) {
      return <span className="terminal-command">{message}</span>;
    }
    return message;
  };

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Blinking cursor effect
  useEffect(() => {
    if (!isLoading) return;
    
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    
    return () => clearInterval(cursorInterval);
  }, [isLoading]);

  return (
    <div className={`border rounded-md overflow-hidden flex flex-col ${className}`}>
      <div className="bg-muted px-4 py-2 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive"></div>
            <div className="h-3 w-3 rounded-full bg-warning"></div>
            <div className="h-3 w-3 rounded-full bg-success"></div>
          </div>
          <span className="font-medium">{title}</span>
        </div>
        {isLoading && (
          <Badge variant="outline" className="bg-muted-foreground/10">
            <div className="animate-pulse bg-primary/20 rounded-full h-2 w-2 mr-2"></div>
            Processing...
          </Badge>
        )}
      </div>
      <div
        ref={terminalRef}
        className="terminal h-[300px] overflow-auto p-4 text-sm font-mono"
      >
        {logs.map((log, index) => (
          <div key={index} className="whitespace-pre-wrap mb-1">
            {parseLogMessage(log)}
          </div>
        ))}
        {isLoading && (
          <div className="flex">
            <span className="mr-1">$</span>
            {showCursor && <span className="terminal-cursor"></span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalConsole;
