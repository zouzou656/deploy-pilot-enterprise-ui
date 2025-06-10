// src/components/ui-custom/CodeEditor.tsx

import React, { useState, useRef } from 'react';
import { Editor, OnMount } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Code, Maximize2, Minimize2 } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string | number;
  className?: string;
  showLineNumbers?: boolean;
  title?: string;
  tabs?: { value: string; label: string; content: string }[];
  // New callback: parent can get the Monaco editor instance
  onEditorMount?: (editor: any) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'json',
  readOnly = false,
  height = '400px',
  className = '',
  showLineNumbers = true,
  title,
  tabs,
  onEditorMount,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.value || 'main');
  const [isExpanded, setIsExpanded] = useState(false);
  const editorRef = useRef<any>(null);

  // Called when Monaco editor mounts
  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    if (onEditorMount) {
      onEditorMount(editor);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    const textToCopy = tabs
      ? tabs.find(tab => tab.value === activeTab)?.content || value
      : value;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format document via Monaco
  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  // Toggle full‐screen
  const handleExpandToggle = () => {
    setIsExpanded(prev => !prev);
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
  };

  const renderEditor = (content: string, lang = language) => (
    <Editor
      height={height}
      defaultLanguage={lang}
      value={content}
      theme={document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs-light'}
      options={{
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: showLineNumbers ? 'on' : 'off',
        lineDecorationsWidth: showLineNumbers ? 10 : 0,
        glyphMargin: false,
        folding: true,
        renderLineHighlight: 'line',
        formatOnPaste: true,
        formatOnType: true,
        scrollbar: {
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        },
      }}
      onChange={(val) => onChange && onChange(val || '')}
      onMount={handleEditorMount}
    />
  );

  return (
    <>
      {/* If expanded into full-screen, overlay a fixed container */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="font-medium">
                {title || (tabs ? 'Code Editor' : language.toUpperCase())}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFormat}
                title="Format Document"
              >
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                title={copied ? 'Copied' : 'Copy to Clipboard'}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandToggle}
                title="Collapse Editor"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {tabs ? (
              <div className="h-full flex flex-col">
                <div className="bg-gray-50 dark:bg-gray-700 border-b px-4">
                  <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="bg-transparent h-10">
                      {tabs.map(tab => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="data-[state=active]:bg-background rounded-t-md rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                <div className="flex-1 overflow-hidden">
                  {tabs.map(tab => (
                    <TabsContent
                      key={tab.value}
                      value={tab.value}
                      className="mt-0 p-0 h-full"
                    >
                      {renderEditor(tab.content)}
                    </TabsContent>
                  ))}
                </div>
              </div>
            ) : (
              renderEditor(value)
            )}
          </div>
        </div>
      )}

      {/* Normal (non-expanded) editor container */}
      <div className={`border rounded-md overflow-hidden ${className}`}>
        {/* Header bar */}
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            <span className="font-medium">
              {title || (tabs ? 'Code Editor' : language.toUpperCase())}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFormat}
              title="Format Document"
            >
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              title={copied ? 'Copied' : 'Copy to Clipboard'}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandToggle}
              title="Expand Editor"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {tabs ? (
          <div className="h-full flex flex-col">
            <div className="bg-gray-50 dark:bg-gray-700 border-b px-4">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="bg-transparent h-10">
                  {tabs.map(tab => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="data-[state=active]:bg-background rounded-t-md rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <div className="flex-1 overflow-hidden">
              {tabs.map(tab => (
                <TabsContent
                  key={tab.value}
                  value={tab.value}
                  className="mt-0 p-0 h-full"
                >
                  {renderEditor(tab.content)}
                </TabsContent>
              ))}
            </div>
          </div>
        ) : (
          renderEditor(value)
        )}
      </div>
    </>
  );
};

export default CodeEditor;
