
import React, { useState, useMemo } from 'react';
import { Code, Search, ChevronDown, ChevronRight, FolderPlus } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import FileTree, { FileEntry, TreeNode } from './FileTree';

type FileSelectionStepProps = {
  treeData: TreeNode[];
  filesExpanded: Set<string>;
  setFilesExpanded: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedFiles: string[];
  toggleFile: (path: string) => void;
  setHighlighted: (file: FileEntry | null) => void;
  filesToShow: FileEntry[];
};

const FileSelectionStep: React.FC<FileSelectionStepProps> = ({
  treeData,
  filesExpanded,
  setFilesExpanded,
  selectedFiles,
  toggleFile,
  setHighlighted,
  filesToShow
}) => {
  const [filesOpen, setFilesOpen] = useState(true);
  const [fileSearch, setFileSearch] = useState('');

  // Filter tree nodes recursively based on search
  const filterTreeNodes = (nodes: TreeNode[], search: string): TreeNode[] => {
    if (!search.trim()) return nodes;
    const searchLower = search.toLowerCase();
    
    return nodes.reduce((acc: TreeNode[], node) => {
      const matchesSearch = node.name.toLowerCase().includes(searchLower);
      const filteredChildren = node.children ? filterTreeNodes(node.children, search) : [];
      
      if (matchesSearch || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren
        });
      }
      
      return acc;
    }, []);
  };

  const filteredTreeData = useMemo(() => 
    filterTreeNodes(treeData, fileSearch), 
    [treeData, fileSearch]
  );

  // Enhanced folder selection function
  const toggleFolder = (folderPath: string) => {
    const getAllFilesInFolder = (nodes: TreeNode[], targetPath: string): string[] => {
      let files: string[] = [];
      
      for (const node of nodes) {
        if (node.path === targetPath || node.path.startsWith(targetPath + '/')) {
          if (node.isFile) {
            files.push(node.path);
          } else {
            files = files.concat(getAllFilesInFolder(node.children, node.path));
          }
        }
      }
      
      return files;
    };

    const filesInFolder = getAllFilesInFolder(treeData, folderPath);
    const allSelected = filesInFolder.every(f => selectedFiles.includes(f));
    
    // If all files in folder are selected, deselect them; otherwise select all
    if (allSelected) {
      filesInFolder.forEach(file => {
        if (selectedFiles.includes(file)) {
          toggleFile(file);
        }
      });
    } else {
      filesInFolder.forEach(file => {
        if (!selectedFiles.includes(file)) {
          toggleFile(file);
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 text-white rounded-lg">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">File Selection</h2>
              <p className="text-sm text-muted-foreground font-normal">
                Choose files and folders for your JAR deployment
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* File Tree Section */}
      <Card>
        <Collapsible open={filesOpen} onOpenChange={setFilesOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 text-white rounded-lg">
                    <FolderPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Project Files</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {selectedFiles.length} files selected • Click folders to select all files inside
                    </p>
                  </div>
                </div>
                {filesOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files and folders..."
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* File Tree */}
              <div className="border rounded-lg bg-muted/20">
                <FileTree
                  treeData={filteredTreeData}
                  expanded={filesExpanded}
                  setExpanded={setFilesExpanded}
                  selectedFiles={selectedFiles}
                  toggleFile={toggleFile}
                  toggleFolder={toggleFolder}
                  onHighlight={setHighlighted}
                  filesToShow={filesToShow}
                />
              </div>

              {/* Selection Summary */}
              {selectedFiles.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                        <strong>{selectedFiles.length}</strong> files selected for deployment
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Ready to proceed
                    </Badge>
                  </div>
                </div>
              )}

              {filteredTreeData.length === 0 && fileSearch && (
                <div className="p-8 text-center text-muted-foreground">
                  <Code className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No files match your search criteria</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default FileSelectionStep;
