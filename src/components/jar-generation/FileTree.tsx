
import React from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen, File, CheckSquare, Square, FolderPlus } from 'lucide-react';
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
  toggleFolder?: (path: string) => void;
  onHighlight: (fe: FileEntry) => void;
  level?: number;
};

// Enhanced tree view with folder selection support
export const TreeView = ({
  nodes,
  expanded,
  onToggle,
  selected,
  toggleFile,
  toggleFolder,
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

  const getFolderSelectionState = (node: TreeNode) => {
    if (node.isFile) return null;
    
    const getAllFilesInFolder = (folderNode: TreeNode): string[] => {
      let files: string[] = [];
      folderNode.children.forEach(child => {
        if (child.isFile) {
          files.push(child.path);
        } else {
          files = files.concat(getAllFilesInFolder(child));
        }
      });
      return files;
    };

    const filesInFolder = getAllFilesInFolder(node);
    const selectedFilesInFolder = filesInFolder.filter(f => selected.includes(f));
    
    if (selectedFilesInFolder.length === 0) return 'none';
    if (selectedFilesInFolder.length === filesInFolder.length) return 'all';
    return 'partial';
  };

  return (
    <ul className={cn("space-y-1", level > 0 && "ml-4 border-l border-gray-200 dark:border-gray-700 pl-3")}>
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
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group transition-all duration-200">
                <button
                  className="flex items-center gap-2 flex-1 min-w-0"
                  onClick={() => onToggle(node.path)}
                >
                  {expanded.has(node.path) ? (
                    <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 shrink-0" />
                  )}
                  
                  {expanded.has(node.path) ? (
                    <FolderOpen className="h-4 w-4 text-blue-500 shrink-0" />
                  ) : (
                    <Folder className="h-4 w-4 text-blue-500 shrink-0" />
                  )}
                  
                  <span className="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {node.name}
                  </span>
                </button>
                
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {node.children.filter(c => c.isFile).length} files
                  </span>
                  
                  {toggleFolder && (
                    <button
                      onClick={() => toggleFolder(node.path)}
                      className="p-1 rounded hover:bg-muted transition-colors"
                      title="Select/deselect all files in this folder"
                    >
                      {(() => {
                        const selectionState = getFolderSelectionState(node);
                        if (selectionState === 'all') {
                          return <CheckSquare className="h-4 w-4 text-green-600" />;
                        } else if (selectionState === 'partial') {
                          return <Square className="h-4 w-4 text-amber-600 fill-current opacity-50" />;
                        } else {
                          return <FolderPlus className="h-4 w-4 text-gray-400 hover:text-gray-600" />;
                        }
                      })()}
                    </button>
                  )}
                </div>
              </div>
              
              {expanded.has(node.path) && (
                <TreeView
                  nodes={node.children}
                  expanded={expanded}
                  onToggle={onToggle}
                  selected={selected}
                  toggleFile={toggleFile}
                  toggleFolder={toggleFolder}
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
  toggleFolder?: (path: string) => void;
  onHighlight: (fe: FileEntry) => void;
  filesToShow: FileEntry[];
};

// Enhanced file tree with folder selection controls
const FileTree = ({ 
  treeData,
  expanded,
  setExpanded,
  selectedFiles,
  toggleFile,
  toggleFolder,
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
    <div className="space-y-3">
      {/* Compact Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={expandAll} className="h-7 text-xs">
            <FolderOpen className="h-3 w-3 mr-1" />
            Expand All
          </Button>
          <Button size="sm" variant="outline" onClick={collapseAll} className="h-7 text-xs">
            <Folder className="h-3 w-3 mr-1" />
            Collapse
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={selectAll}
            disabled={selectedFiles.length === filesToShow.length}
            className="h-7 text-xs"
          >
            <CheckSquare className="h-3 w-3 mr-1" />
            Select All
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={clearSelection}
            disabled={selectedFiles.length === 0}
            className="h-7 text-xs"
          >
            <Square className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* File Tree */}
      <div className="border rounded-lg bg-white dark:bg-gray-950">
        <ScrollArea className="h-80 p-3">
          {treeData.length > 0 ? (
            <TreeView
              nodes={treeData}
              expanded={expanded}
              onToggle={toggleExp}
              selected={selectedFiles}
              toggleFile={toggleFile}
              toggleFolder={toggleFolder}
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
    </div>
  );
};

export default FileTree;
