
import React from 'react';
import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

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
};

// Reusable tree view, with onToggle (folders), toggleFile (checkbox), onHighlight (click file)
export const TreeView = ({
  nodes,
  expanded,
  onToggle,
  selected,
  toggleFile,
  onHighlight,
}: TreeViewProps) => {
  return (
    <ul className="pl-4 space-y-1">
      {nodes.map((n) => (
        <li key={n.path}>
          {n.isFile ? (
            <div className="flex justify-between items-center p-1 hover:bg-muted/10 rounded">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selected.includes(n.path)}
                  onCheckedChange={() => toggleFile(n.path)}
                />
                <button
                  className="text-left hover:underline text-sm"
                  onClick={() =>
                    onHighlight({
                      filename: n.path,
                      status: n.status!,
                      patch: n.patch,
                    })
                  }
                >
                  {n.name}
                </button>
              </div>
              <span className="text-xs uppercase text-muted-foreground">
                {n.status}
              </span>
            </div>
          ) : (
            <div className="mb-1">
              <div
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => onToggle(n.path)}
              >
                {expanded.has(n.path) ? (
                  <ChevronDown className="h-4 w-4"/>
                ) : (
                  <ChevronRight className="h-4 w-4"/>
                )}
                <Folder className="h-4 w-4"/>
                <span className="font-medium">{n.name}</span>
              </div>
              {expanded.has(n.path) && (
                <TreeView
                  nodes={n.children}
                  expanded={expanded}
                  onToggle={onToggle}
                  selected={selected}
                  toggleFile={toggleFile}
                  onHighlight={onHighlight}
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

// File tree component with expand/collapse controls
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

  // Collect folder‐paths for "expand all"
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
    <div>
      <div className="flex justify-end mb-2 gap-2">
        <Button size="sm" variant="outline" onClick={expandAll}>
          Expand All
        </Button>
        <Button size="sm" variant="outline" onClick={collapseAll}>
          Collapse All
        </Button>
      </div>
      <ScrollArea className="h-80 p-2 border rounded">
        <TreeView
          nodes={treeData}
          expanded={expanded}
          onToggle={toggleExp}
          selected={selectedFiles}
          toggleFile={toggleFile}
          onHighlight={onHighlight}
        />
      </ScrollArea>
      <div className="mt-2 flex justify-end space-x-4">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => filesToShow.forEach(f => toggleFile(f.filename))}
        >
          Select All
        </Button>
        <Button size="sm" variant="outline" onClick={() => selectedFiles.forEach(toggleFile)}>
          Clear
        </Button>
      </div>
    </div>
  );
};

export default FileTree;
