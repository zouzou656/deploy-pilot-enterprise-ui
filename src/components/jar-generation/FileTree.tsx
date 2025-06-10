
import React from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen, File, CheckSquare, Square } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type TreeNode = {
  name: string;
  path: string;
  children: TreeNode[];
  isFile: boolean;
  status?: string;
  patch?: string;
};

export type FileEntry = { 
  filename: string; 
  status: string; 
  patch?: string;
};

type TreeViewProps = {
  nodes: TreeNode[];
  expanded: Set<string>;
  onToggle: (path: string) => void;
  selected: string[];
  toggleFile: (path: string) => void;
  onHighlight: (fe: FileEntry) => void;
  level?: number;
};

// Enhanced tree view with better styling
export const TreeView = ({
  nodes,
  expanded,
  onToggle,
  selected,
  toggleFile,
  onHighlight,
  level = 0,
}: TreeViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'added':
        return 'text-green-600 bg-green-50 dark:bg-green-950/20';
      case 'modified':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
      case 'deleted':
        return 'text-red-600 bg-red-50 dark:bg-red-950/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  return (
    <ul className={cn("space-y-1", level > 0 && "ml-6 border-l border-gray-200 dark:border-gray-700 pl-4")}>
      {nodes.map((node) => (
        <li key={node.path}>
          {node.isFile ? (
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 group transition-all duration-200">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Checkbox
                  checked={selected.includes(node.path)}
                  onCheckedChange={() => toggleFile(node.path)}
                  className="shrink-0"
                />
                
                <File className="h-4 w-4 text-gray-500 shrink-0" />
                
                <button
                  className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate flex-1 text-sm font-medium"
                  onClick={() =>
                    onHighlight({
                      filename: node.path,
                      status: node.status!,
                      patch: node.patch,
                    })
                  }
                  title={node.name}
                >
                  {node.name}
                </button>
              </div>
              
              {node.status && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs uppercase font-medium", getStatusColor(node.status))}
                >
                  {node.status}
                </Badge>
              )}
            </div>
          ) : (
            <div>
              <div
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer group transition-all duration-200"
                onClick={() => onToggle(node.path)}
              >
                {expanded.has(node.path) ? (
                  <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                )}
                
                {expanded.has(node.path) ? (
                  <FolderOpen className="h-4 w-4 text-blue-500" />
                ) : (
                  <Folder className="h-4 w-4 text-blue-500" />
                )}
                
                <span className="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {node.name}
                </span>
                
                <span className="text-xs text-muted-foreground ml-auto">
                  {node.children.filter(c => c.isFile).length} files
                </span>
              </div>
              
              {expanded.has(node.path) && (
                <TreeView
                  nodes={node.children}
                  expanded={expanded}
                  onToggle={onToggle}
                  selected={selected}
                  toggleFile={toggleFile}
                  onHighlight={onHighlight}
                  level={level + 1}
                />
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

type FileTreeProps = {
  treeData: TreeNode[];
  expanded: Set<string>;
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedFiles: string[];
  toggleFile: (path: string) => void;
  onHighlight: (fe: FileEntry) => void;
  filesToShow: FileEntry[];
};

// Enhanced file tree with better controls
const FileTree = ({ 
  treeData,
  expanded,
  setExpanded,
  selectedFiles,
  toggleFile,
  onHighlight,
  filesToShow
}: FileTreeProps) => {
  const toggleExp = (path: string) => {
    setExpanded((s) => {
      const ns = new Set(s);
      ns.has(path) ? ns.delete(path) : ns.add(path);
      return ns;
    });
  };

  const expandAll = () => {
    const folders = collectFolders(treeData);
    setExpanded(new Set(folders));
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  const selectAll = () => {
    filesToShow.forEach(f => {
      if (!selectedFiles.includes(f.filename)) {
        toggleFile(f.filename);
      }
    });
  };

  const clearSelection = () => {
    selectedFiles.forEach(toggleFile);
  };

  const collectFolders = (nodes: TreeNode[]): string[] => {
    let out: string[] = [];
    nodes.forEach((n) => {
      if (!n.isFile) {
        out.push(n.path);
        out = out.concat(collectFolders(n.children));
      }
    });
    return out;
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={expandAll} className="h-8">
            <FolderOpen className="h-4 w-4 mr-2" />
            Expand All
          </Button>
          <Button size="sm" variant="outline" onClick={collapseAll} className="h-8">
            <Folder className="h-4 w-4 mr-2" />
            Collapse All
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={selectAll}
            disabled={selectedFiles.length === filesToShow.length}
            className="h-8"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Select All
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={clearSelection}
            disabled={selectedFiles.length === 0}
            className="h-8"
          >
            <Square className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* File Tree */}
      <div className="border rounded-lg bg-white dark:bg-gray-950">
        <ScrollArea className="h-96 p-4">
          {treeData.length > 0 ? (
            <TreeView
              nodes={treeData}
              expanded={expanded}
              onToggle={toggleExp}
              selected={selectedFiles}
              toggleFile={toggleFile}
              onHighlight={onHighlight}
            />
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No files found</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
      
      {/* Selection Summary */}
      {selectedFiles.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>{selectedFiles.length}</strong> files selected for deployment
          </p>
        </div>
      )}
    </div>
  );
};

export default FileTree;
