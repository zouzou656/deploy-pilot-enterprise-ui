import React, { useEffect, useRef } from 'react';

interface TerminalConsoleProps {
  /** 
   * All log lines concatenated with newline `\n` separators. 
   * The component will split on `\n` and render each line. 
   */
  logs: string;
  /** Optional height override (defaults to 100%). */
  height?: string | number;
}

const TerminalConsole: React.FC<TerminalConsoleProps> = ({ logs, height = '100%' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom whenever `logs` changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={containerRef}
      className="bg-black text-green-200 font-mono text-sm p-2 overflow-auto"
      style={{ height }}
    >
      {logs.split('\n').map((line, idx) => (
        <div key={idx}>{line}</div>
      ))}
    </div>
  );
};

export default TerminalConsole;
