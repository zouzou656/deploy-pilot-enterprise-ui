
import React, { useEffect, useRef } from 'react';

interface TerminalConsoleProps {
  logs?: string;
  className?: string;
}

const TerminalConsole = ({ logs, className = '' }: TerminalConsoleProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div 
      ref={terminalRef}
      className={`font-mono text-sm bg-black text-green-400 p-4 overflow-auto h-full ${className}`}
    >
      {logs ? logs.split('\n').map((line, index) => (
        <div key={index} className="whitespace-pre-wrap">
          {line}
        </div>
      )) : (
        <div>No logs available</div>
      )}
    </div>
  );
};

export default TerminalConsole;
