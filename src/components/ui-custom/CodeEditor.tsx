
import React, { useState, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Code } from 'lucide-react';

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
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.value || 'main');
  const editorRef = useRef<any>(null);
  
  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleCopy = () => {
    const textToCopy = tabs 
      ? tabs.find(tab => tab.value === activeTab)?.content || value
      : value;
      
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
        scrollbar: {
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        },
      }}
      onChange={(value) => onChange && onChange(value || '')}
      onMount={handleEditorMount}
    />
  );

  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      <div className="bg-muted px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <span className="font-medium">{title || (tabs ? 'Code Editor' : language.toUpperCase())}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
      
      {tabs ? (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="bg-muted/50 border-b px-4">
            <TabsList className="bg-transparent h-10">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-background rounded-t-md rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0 p-0">
              {renderEditor(tab.content)}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        renderEditor(value)
      )}
    </div>
  );
};

export default CodeEditor;
