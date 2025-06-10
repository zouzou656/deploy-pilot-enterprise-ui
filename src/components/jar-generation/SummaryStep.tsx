
import React, { useState } from 'react';
import { CheckCircle, Package, Server, GitBranch, Settings, FileText, Search, Download, Zap } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Project, Environment, FileOverride } from '@/types/project';
import { FileEntry } from './FileTree';

type SummaryStepProps = {
  branch: string;
  version: string;
  strategy: 'commit' | 'full' | 'manual';
  selectedFiles: string[];
  filesToShow: {filename: string, status: string}[];
  project: Project | null;
  environment: Environment | null;
  applyOverrides: boolean;
  fileOverrides: FileOverride[];
  onConfirm: () => void;
  onBack: () => void;
};

const SummaryStep: React.FC<SummaryStepProps> = ({
  branch,
  version,
  strategy,
  selectedFiles,
  filesToShow,
  project,
  environment,
  applyOverrides,
  fileOverrides,
  onConfirm,
  onBack,
}) => {
  const [fileSearch, setFileSearch] = useState('');
  const [overrideSearch, setOverrideSearch] = useState('');

  const statusCounts = selectedFiles.reduce<Record<string, number>>(
    (acc, filename) => {
      const file = filesToShow.find(f => f.filename === filename);
      const status = file?.status || 'unchanged';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {}
  );

  const filteredFiles = selectedFiles.filter(filename => 
    filename.toLowerCase().includes(fileSearch.toLowerCase())
  );

  const filteredOverrides = fileOverrides.filter(override =>
    override.filePath.toLowerCase().includes(overrideSearch.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap = {
      add: { label: 'Added', color: 'bg-green-100 text-green-800' },
      modify: { label: 'Modified', color: 'bg-blue-100 text-blue-800' },
      delete: { label: 'Deleted', color: 'bg-red-100 text-red-800' },
      unchanged: { label: 'Unchanged', color: 'bg-gray-100 text-gray-800' }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.unchanged;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStrategyDisplay = () => {
    switch (strategy) {
      case 'full': return 'Full Build';
      case 'commit': return 'Single Commit';
      case 'manual': return 'Manual Selection';
      default: return strategy;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-full shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              JAR Generation Summary
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Review your configuration and files before generating your JAR
          </p>
        </div>

        {/* Main Summary Card */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm dark:bg-gray-900/90">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-600/20 dark:to-blue-600/20 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <CheckCircle className="h-7 w-7 text-green-600" />
              Final Review
            </CardTitle>
            <CardDescription className="text-lg">
              Verify all settings before generating your deployment JAR
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 space-y-8">
            {/* Project and Environment Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Card */}
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Name:</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-300">{project.name}</span>
                      </div>
                      {project.description && (
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-gray-600 dark:text-gray-300">Description:</span>
                          <span className="text-sm text-right max-w-48">{project.description}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Repository:</span>
                        <p className="font-mono text-xs mt-1 p-2 bg-blue-100 dark:bg-blue-900/50 rounded break-all">
                          {project.gitRepoUrl}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-muted-foreground">No project selected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Environment Card */}
              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Server className="h-5 w-5 text-purple-600" />
                    Target Environment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {environment ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Name:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-purple-700 dark:text-purple-300">{environment.name}</span>
                          {environment.isProduction && (
                            <Badge className="bg-red-100 text-red-800">PROD</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Host:</span>
                        <span className="font-mono text-sm">{environment.host}:{environment.port}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Type:</span>
                        <Badge className={environment.isProduction ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                          {environment.isProduction ? 'Production' : 'Development'}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Server className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-muted-foreground">No environment selected</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Build Configuration */}
            <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-green-600" />
                  Build Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
                    <GitBranch className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <div className="font-medium text-gray-600 dark:text-gray-300">Branch</div>
                    <div className="font-semibold text-lg text-green-700 dark:text-green-300">{branch}</div>
                  </div>
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
                    <Settings className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                    <div className="font-medium text-gray-600 dark:text-gray-300">Strategy</div>
                    <div className="font-semibold text-lg text-blue-700 dark:text-blue-300">{getStrategyDisplay()}</div>
                  </div>
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
                    <Package className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                    <div className="font-medium text-gray-600 dark:text-gray-300">Version</div>
                    <div className="font-semibold text-lg text-purple-700 dark:text-purple-300">{version}</div>
                  </div>
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
                    <FileText className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                    <div className="font-medium text-gray-600 dark:text-gray-300">Total Files</div>
                    <div className="font-semibold text-lg text-orange-700 dark:text-orange-300">{selectedFiles.length}</div>
                  </div>
                </div>
                
                {/* File Status Breakdown */}
                {Object.keys(statusCounts).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-700">
                    <h4 className="font-semibold mb-3 text-green-700 dark:text-green-300">File Status Breakdown</h4>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(statusCounts).map(([status, count]) => (
                        <div key={status} className="flex items-center gap-2">
                          {getStatusBadge(status)}
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* File Overrides Section */}
            {environment && (
              <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-amber-600" />
                    File Overrides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {fileOverrides.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border">
                        <span className="font-medium">Override Status:</span>
                        {applyOverrides ? (
                          <Badge className="bg-green-100 text-green-800">
                            ✓ {fileOverrides.length} overrides will be applied
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800">
                            ⚠ Overrides disabled
                          </Badge>
                        )}
                      </div>
                      
                      {applyOverrides && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Search className="h-4 w-4 text-amber-600" />
                            <Input
                              placeholder="Search overrides..."
                              value={overrideSearch}
                              onChange={(e) => setOverrideSearch(e.target.value)}
                              className="max-w-sm"
                            />
                          </div>
                          
                          <ScrollArea className="h-48 border rounded-lg bg-white/70 dark:bg-gray-800/70">
                            <div className="p-4 space-y-3">
                              {filteredOverrides.map((override) => (
                                <div key={override.id} className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-mono text-sm font-semibold text-amber-800 dark:text-amber-200">
                                      {override.filePath}
                                    </span>
                                    <Badge className="bg-amber-100 text-amber-800 ml-2">Override</Badge>
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">Content:</span>
                                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                                      {override.content.length > 100 
                                        ? `${override.content.substring(0, 100)}...` 
                                        : override.content
                                      }
                                    </pre>
                                  </div>
                                </div>
                              ))}
                              
                              {filteredOverrides.length === 0 && overrideSearch && (
                                <div className="text-center py-4 text-muted-foreground">
                                  No overrides match your search
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-muted-foreground">No file overrides configured</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Selected Files Section */}
            <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Selected Files ({selectedFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFiles.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-indigo-600" />
                      <Input
                        placeholder="Search files..."
                        value={fileSearch}
                        onChange={(e) => setFileSearch(e.target.value)}
                        className="max-w-sm"
                      />
                      <Badge className="bg-indigo-100 text-indigo-800">
                        {filteredFiles.length} of {selectedFiles.length}
                      </Badge>
                    </div>
                    
                    <ScrollArea className="h-64 border rounded-lg bg-white/70 dark:bg-gray-800/70">
                      <div className="p-4 space-y-2">
                        {filteredFiles.map((filename) => {
                          const file = filesToShow.find(f => f.filename === filename);
                          return (
                            <div key={filename} className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded border border-indigo-200 dark:border-indigo-800">
                              <code className="text-sm font-mono text-indigo-800 dark:text-indigo-200 flex-1">
                                {filename}
                              </code>
                              {file && getStatusBadge(file.status)}
                            </div>
                          );
                        })}
                        
                        {filteredFiles.length === 0 && fileSearch && (
                          <div className="text-center py-8 text-muted-foreground">
                            No files match your search
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-muted-foreground">No files selected</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Final Confirmation Alert */}
            <Alert className="border-2 border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-200">Ready to Generate JAR!</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300 text-base">
                This will create a JAR file with <strong>{selectedFiles.length} files</strong> from <strong>{project?.name || 'the selected project'}</strong>
                {environment && (
                  <> targeting the <strong>{environment.name}</strong> environment</>
                )}
                {applyOverrides && fileOverrides.length > 0 && (
                  <> with <strong>{fileOverrides.length} file overrides</strong> applied</>
                )}.
              </AlertDescription>
            </Alert>
          </CardContent>
          
          <CardFooter className="flex justify-between p-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-b-lg">
            <Button variant="outline" onClick={onBack} size="lg" className="px-8">
              ← Back to Preview
            </Button>
            <Button 
              onClick={onConfirm} 
              size="lg" 
              className="px-8 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg"
              disabled={selectedFiles.length === 0}
            >
              <Zap className="h-5 w-5 mr-2" />
              Generate JAR
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SummaryStep;
