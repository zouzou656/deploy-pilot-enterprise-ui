import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Download, 
  Copy, 
  Trash2, 
  Settings, 
  Play, 
  Pause,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Filter,
  Hash,
  Clock,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toast } from 'sonner';

interface LogLine {
  timestamp: string;
  level: string;
  message: string;
  raw: string;
}

interface EnhancedTerminalProps {
  logs: string[];
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

const LOG_LEVEL_COLORS = {
  INFO: 'text-cyan-400',
  DEBUG: 'text-green-400', 
  WARN: 'text-yellow-400',
  WARNING: 'text-yellow-400',
  ERROR: 'text-red-400',
  FATAL: 'text-red-600',
  DEFAULT: 'text-gray-300'
};

const LOG_LEVEL_BADGES = {
  INFO: 'bg-cyan-900/30 text-cyan-300 border-cyan-700',
  DEBUG: 'bg-green-900/30 text-green-300 border-green-700',
  WARN: 'bg-yellow-900/30 text-yellow-300 border-yellow-700', 
  WARNING: 'bg-yellow-900/30 text-yellow-300 border-yellow-700',
  ERROR: 'bg-red-900/30 text-red-300 border-red-700',
  FATAL: 'bg-red-900/50 text-red-200 border-red-600',
  DEFAULT: 'bg-gray-900/30 text-gray-300 border-gray-700'
};

export default function EnhancedTerminal({ 
  logs, 
  isExpanded = false, 
  onToggleExpand,
  className = '' 
}: EnhancedTerminalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set(['INFO', 'DEBUG', 'WARN', 'WARNING', 'ERROR', 'FATAL']));
  const [autoScroll, setAutoScroll] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [wrapText, setWrapText] = useState(true);
  const [fontSize, setFontSize] = useState(12);
  const [showSettings, setShowSettings] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Parse logs into structured format
  const parsedLogs = useMemo(() => {
    return logs.map((line, index) => {
      const timestampMatch = line.match(/\[([^\]]+)\]/);
      const levelMatch = line.match(/\[(INFO|DEBUG|WARN|WARNING|ERROR|FATAL)\]/);
      
      return {
        timestamp: timestampMatch?.[1] || new Date().toISOString(),
        level: levelMatch?.[1] || 'INFO',
        message: line.replace(/\[[^\]]+\]/g, '').trim(),
        raw: line
      };
    });
  }, [logs]);

  // Filter logs based on search and level filters
  const filteredLogs = useMemo(() => {
    return parsedLogs.filter(log => {
      const matchesSearch = searchTerm === '' || 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.level.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = selectedLevels.has(log.level);
      return matchesSearch && matchesLevel;
    });
  }, [parsedLogs, searchTerm, selectedLevels]);

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [filteredLogs, autoScroll]);

  // Get log statistics
  const logStats = useMemo(() => {
    const stats = { INFO: 0, DEBUG: 0, WARN: 0, WARNING: 0, ERROR: 0, FATAL: 0, total: parsedLogs.length };
    parsedLogs.forEach(log => {
      if (stats.hasOwnProperty(log.level)) {
        stats[log.level as keyof typeof stats]++;
      }
    });
    stats.WARN += stats.WARNING; // Combine WARN and WARNING
    return stats;
  }, [parsedLogs]);

  const toggleLevel = (level: string) => {
    const newSelected = new Set(selectedLevels);
    if (newSelected.has(level)) {
      newSelected.delete(level);
    } else {
      newSelected.add(level);
    }
    setSelectedLevels(newSelected);
  };

  const copyAllLogs = () => {
    const logText = filteredLogs.map(log => log.raw).join('\n');
    navigator.clipboard.writeText(logText);
    toast.success('Logs copied to clipboard');
  };

  const exportLogs = (format: 'txt' | 'json') => {
    let content: string;
    let filename: string;
    
    if (format === 'json') {
      content = JSON.stringify(filteredLogs, null, 2);
      filename = `jar-logs-${Date.now()}.json`;
    } else {
      content = filteredLogs.map(log => log.raw).join('\n');
      filename = `jar-logs-${Date.now()}.txt`;
    }
    
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Logs exported as ${format.toUpperCase()}`);
  };

  const highlightSearch = (text: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-400 text-black">$1</mark>');
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Terminal Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-gray-300 text-sm font-mono ml-2">jar-generation-logs</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {filteredLogs.length} / {parsedLogs.length} lines
            </span>
            {onToggleExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
                className="text-gray-400 hover:text-white"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 space-y-2">
        {/* Search and Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAllLogs}
            className="text-gray-300 hover:text-white"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => exportLogs('txt')}
            className="text-gray-300 hover:text-white"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-300 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Log Level Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 mr-2">Filters:</span>
          {['INFO', 'DEBUG', 'WARN', 'ERROR', 'FATAL'].map(level => (
            <Badge
              key={level}
              variant="outline"
              className={`cursor-pointer text-xs ${
                selectedLevels.has(level) 
                  ? LOG_LEVEL_BADGES[level as keyof typeof LOG_LEVEL_BADGES] 
                  : 'bg-gray-700 text-gray-500 border-gray-600'
              }`}
              onClick={() => toggleLevel(level)}
            >
              {level} ({logStats[level as keyof typeof logStats] || 0})
            </Badge>
          ))}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-700 rounded p-3 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded"
                />
                Auto-scroll
              </label>
              
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className="rounded"
                />
                Line numbers
              </label>
              
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showTimestamps}
                  onChange={(e) => setShowTimestamps(e.target.checked)}
                  className="rounded"
                />
                Timestamps
              </label>
              
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={wrapText}
                  onChange={(e) => setWrapText(e.target.checked)}
                  className="rounded"
                />
                Wrap text
              </label>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Font size:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFontSize(Math.max(8, fontSize - 1))}
                className="text-gray-300 hover:text-white h-6 w-6 p-0"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="text-xs text-gray-400 w-8 text-center">{fontSize}px</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFontSize(Math.min(20, fontSize + 1))}
                className="text-gray-300 hover:text-white h-6 w-6 p-0"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="bg-black text-green-400 font-mono overflow-hidden"
        style={{ fontSize: `${fontSize}px` }}
      >
        <ScrollArea 
          ref={scrollAreaRef}
          className={isExpanded ? "h-[calc(100vh-200px)]" : "h-64"}
        >
          <div className="p-2">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`flex ${wrapText ? 'flex-wrap' : ''} items-start gap-2 py-0.5 hover:bg-gray-900/50`}
                >
                  {showLineNumbers && (
                    <span className="text-gray-600 text-xs w-12 flex-shrink-0 text-right select-none">
                      {index + 1}
                    </span>
                  )}
                  
                  {showTimestamps && (
                    <span className="text-gray-500 text-xs flex-shrink-0 w-20">
                      {log.timestamp.split('T')[1]?.split('.')[0] || log.timestamp}
                    </span>
                  )}
                  
                  <span className={`text-xs px-1 rounded flex-shrink-0 ${LOG_LEVEL_COLORS[log.level as keyof typeof LOG_LEVEL_COLORS] || LOG_LEVEL_COLORS.DEFAULT}`}>
                    [{log.level}]
                  </span>
                  
                  <span 
                    className={`flex-1 ${wrapText ? '' : 'whitespace-nowrap overflow-hidden'}`}
                    dangerouslySetInnerHTML={{ 
                      __html: highlightSearch(log.message) 
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                {parsedLogs.length === 0 ? 'No logs yet...' : 'No logs match current filters'}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Terminal Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-1">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>Total: {logStats.total}</span>
            <span className="text-red-400">Errors: {logStats.ERROR + logStats.FATAL}</span>
            <span className="text-yellow-400">Warnings: {logStats.WARN}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {autoScroll && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className="text-gray-400 hover:text-white h-6 px-2"
            >
              {autoScroll ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}