
import React from 'react';
import { Code, FileText, FolderOpen } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
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
  // Calculate statistics
  const totalFiles = filesToShow.length;
  const selectedCount = selectedFiles.length;
  const fileTypes = filesToShow.reduce((acc, file) => {
    const ext = file.filename.split('.').pop()?.toLowerCase() || 'no-ext';
    acc[ext] = (acc[ext] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-full">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">File Selection</h3>
                <p className="text-muted-foreground">
                  {selectedCount} of {totalFiles} files selected
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {Object.entries(fileTypes).slice(0, 5).map(([ext, count]) => (
                <Badge key={ext} variant="outline" className="text-xs">
                  .{ext} ({count})
                </Badge>
              ))}
              {Object.keys(fileTypes).length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{Object.keys(fileTypes).length - 5} more
                </Badge>
              )}
            </div>
          </div>
          
          {selectedCount > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(selectedCount / totalFiles) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round((selectedCount / totalFiles) * 100)}% of files selected
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Tree Card */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FolderOpen className="h-6 w-6 text-white" />
            </div>
            Project Files
          </CardTitle>
          <CardDescription className="text-base">
            Select the files you want to include in your JAR deployment
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <FileTree
            treeData={treeData}
            expanded={filesExpanded}
            setExpanded={setFilesExpanded}
            selectedFiles={selectedFiles}
            toggleFile={toggleFile}
            onHighlight={setHighlighted}
            filesToShow={filesToShow}
          />
        </CardContent>
      </Card>

      {/* Selection Tips */}
      {selectedCount === 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Code className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                  No files selected
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Use the checkboxes to select files for your JAR. You can expand folders and use the "Select All" button for convenience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileSelectionStep;
