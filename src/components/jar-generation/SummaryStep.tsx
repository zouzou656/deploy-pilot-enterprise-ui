
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileEntry } from './FileTree';
import { Package, ArrowRight, CheckCircle } from 'lucide-react';

type SummaryStepProps = {
  branch: string;
  version: string;
  strategy: string;
  selectedFiles: string[];
  filesToShow: FileEntry[];
  onConfirm: () => void;
  onBack: () => void;
};

const SummaryStep: React.FC<SummaryStepProps> = ({
  branch,
  version,
  strategy,
  selectedFiles,
  filesToShow,
  onConfirm,
  onBack
}) => {
  // Group selected files by status
  const filesByStatus: Record<string, number> = {};
  selectedFiles.forEach(filename => {
    const file = filesToShow.find(f => f.filename === filename);
    if (file) {
      const status = file.status || 'unknown';
      filesByStatus[status] = (filesByStatus[status] || 0) + 1;
    }
  });

  const statusLabels: Record<string, string> = {
    'added': 'Added',
    'modified': 'Modified',
    'deleted': 'Deleted',
    'renamed': 'Renamed',
    'unmodified': 'Unchanged',
    'unknown': 'Unknown'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Build Summary
        </CardTitle>
        <CardDescription>
          Review your JAR generation settings before proceeding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuration</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Branch:</span>
                <span className="font-medium">{branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <span className="font-medium">{version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build Mode:</span>
                <span className="font-medium capitalize">{strategy}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Files</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total files:</span>
                <span className="font-medium">{selectedFiles.length}</span>
              </div>
              
              {Object.entries(filesByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="text-muted-foreground">{statusLabels[status] || status}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-muted/30 p-4 rounded-lg border border-muted">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Ready to Build
          </h3>
          <p className="mt-2 text-muted-foreground">
            Your JAR will be generated using {selectedFiles.length} files from the {branch} branch.
            The build will use the {strategy} strategy and will be versioned as {version}.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onConfirm} className="gap-2">
          Generate JAR <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SummaryStep;
