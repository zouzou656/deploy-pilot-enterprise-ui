
import React from 'react';
import { Code } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Code className="inline-block mr-2"/>
          Select Files
        </CardTitle>
        <CardDescription>
          Check the files you wish to deploy
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
  );
};

export default FileSelectionStep;
