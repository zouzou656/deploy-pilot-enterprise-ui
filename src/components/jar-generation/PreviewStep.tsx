
import React, { useState, useMemo } from 'react';
import { Eye, Maximize2, Check, X, ChevronDown, ChevronRight, Search, GitCommit, FileText, Settings, Database } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import DiffViewer from './DiffViewer';
import { TreeView, FileEntry, TreeNode } from './FileTree';
import { FileOverride } from '@/types/project';

type PreviewStepProps = {
  previewTabDisabled: boolean;
  initialHead: string;
  previewBase: string;
  setPreviewBase: (base: string) => void;
  commits: { sha: string; message: string }[];
  loadingCommits: boolean;
  previewTree: TreeNode[];
  previewExpanded: Set<string>;
  toggleExp: (isPreview: boolean, path: string) => void;
  selectedFiles: string[];
  highlighted: FileEntry | null;
  setHighlighted: (file: FileEntry | null) => void;
  projectId: string;
  environmentId: string | null;
  fileOverrides: FileOverride[];
  applyOverrides: boolean;
  setApplyOverrides: (apply: boolean) => void;
  handleGenerate: () => void;
};

const PreviewStep: React.FC<PreviewStepProps> = ({
  previewTabDisabled,
  initialHead,
  previewBase,
  setPreviewBase,
  commits,
  loadingCommits,
  previewTree,
  previewExpanded,
  toggleExp,
  selectedFiles,
  highlighted,
  setHighlighted,
  projectId,
  environmentId,
  fileOverrides,
  applyOverrides,
  setApplyOverrides,
  handleGenerate,
}) => {
  const [commitSearchOpen, setCommitSearchOpen] = useState(true);
  const [filesOpen, setFilesOpen] = useState(true);
  const [diffOpen, setDiffOpen] = useState(true);
  const [overridesOpen, setOverridesOpen] = useState(true);
  
  const [commitSearch, setCommitSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');
  const [overrideSearch, setOverrideSearch] = useState('');

  // Filter commits based on search
  const filteredCommits = useMemo(() => {
    if (!commitSearch.trim()) return commits;
    const searchLower = commitSearch.toLowerCase();
    return commits.filter(c => 
      c.message.toLowerCase().includes(searchLower) ||
      c.sha.toLowerCase().includes(searchLower)
    );
  }, [commits, commitSearch]);

  // Filter file overrides based on search
  const filteredOverrides = useMemo(() => {
    if (!overrideSearch.trim()) return fileOverrides;
    const searchLower = overrideSearch.toLowerCase();
    return fileOverrides.filter(override =>
      override.filePath.toLowerCase().includes(searchLower) ||
      override.content.toLowerCase().includes(searchLower)
    );
  }, [fileOverrides, overrideSearch]);

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

  const filteredTreeNodes = useMemo(() => 
    filterTreeNodes(previewTree, fileSearch), 
    [previewTree, fileSearch]
  );

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Preview & Generate</h2>
              <p className="text-sm text-muted-foreground font-normal">
                Review your changes and apply file overrides before generating the JAR
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {previewTabDisabled ? (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-amber-100 dark:bg-amber-950/50 rounded-full">
                <Eye className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                  Preview Not Available
                </h3>
                <p className="text-amber-600 dark:text-amber-400">
                  Preview is not available in manual mode. All files are taken from the latest commit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Git Configuration Card */}
          <Card>
            <Collapsible open={commitSearchOpen} onOpenChange={setCommitSearchOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 text-white rounded-lg">
                        <GitCommit className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Git Configuration</h3>
                        <p className="text-sm text-muted-foreground font-normal">
                          Configure commit range for diff preview
                        </p>
                      </div>
                    </div>
                    {commitSearchOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          TO
                        </Badge>
                        Fixed HEAD Commit
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Eye className="h-4 w-4 cursor-help text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            This is the target commit for your JAR generation
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <code className="text-sm font-mono">{initialHead.slice(0, 7)}</code>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          FROM
                        </Badge>
                        Base Commit for Preview
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Eye className="h-4 w-4 cursor-help text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Choose a different base for preview comparison only
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search commits..."
                            value={commitSearch}
                            onChange={(e) => setCommitSearch(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        
                        <select
                          className="w-full p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors focus:ring-2 focus:ring-primary focus:border-primary"
                          value={previewBase}
                          onChange={(e) => setPreviewBase(e.target.value)}
                        >
                          {loadingCommits ? (
                            <option>Loading commits...</option>
                          ) : (
                            filteredCommits.map(c => (
                              <option key={c.sha} value={c.sha}>
                                {c.sha.slice(0, 7)} — {c.message}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Files and Diff Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Files Card */}
            <Card>
              <Collapsible open={filesOpen} onOpenChange={setFilesOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 text-white rounded-lg">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Changed Files</h3>
                          <p className="text-sm text-muted-foreground font-normal">
                            {selectedFiles.length} files selected for deployment
                          </p>
                        </div>
                      </div>
                      {filesOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search files..."
                        value={fileSearch}
                        onChange={(e) => setFileSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    
                    <ScrollArea className="h-80 border rounded-lg bg-muted/20">
                      <div className="p-4">
                        <TreeView
                          nodes={filteredTreeNodes}
                          expanded={previewExpanded}
                          onToggle={p => toggleExp(true, p)}
                          selected={selectedFiles}
                          toggleFile={() => {}}
                          onHighlight={f => setHighlighted(f)}
                        />
                      </div>
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Diff Card */}
            <Card>
              <Collapsible open={diffOpen} onOpenChange={setDiffOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 text-white rounded-lg">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">File Diff</h3>
                          <p className="text-sm text-muted-foreground font-normal">
                            {highlighted ? `Viewing: ${highlighted.filename}` : 'Select a file to view diff'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="icon" variant="outline" aria-label="Expand diff">
                              <Maximize2 className="h-4 w-4"/>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
                            <DialogHeader>
                              <DialogTitle>File Diff Preview</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="flex-1 border rounded-lg p-4">
                              {highlighted ? (
                                <DiffViewer {...highlighted} />
                              ) : (
                                <div className="flex items-center justify-center h-32 text-muted-foreground">
                                  <p>Select a file to view its diff</p>
                                </div>
                              )}
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                        {diffOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <ScrollArea className="h-80 border rounded-lg bg-muted/20">
                      <div className="p-4">
                        {highlighted ? (
                          <DiffViewer {...highlighted} />
                        ) : (
                          <div className="flex items-center justify-center h-32 text-muted-foreground">
                            <div className="text-center">
                              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Select a file to view its diff</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        </>
      )}

      {/* File Overrides Card */}
      {environmentId && fileOverrides.length > 0 && (
        <Card>
          <Collapsible open={overridesOpen} onOpenChange={setOverridesOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500 text-white rounded-lg">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">File Overrides</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        {filteredOverrides.length} overrides available for this environment
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="applyOverrides"
                        checked={applyOverrides}
                        onCheckedChange={setApplyOverrides}
                      />
                      <Label htmlFor="applyOverrides" className="text-sm font-medium">
                        Apply Overrides
                      </Label>
                    </div>
                    {overridesOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </CardTitle>
              </CollapsibleTrigger>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search overrides..."
                    value={overrideSearch}
                    onChange={(e) => setOverrideSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <ScrollArea className="h-64 border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium">File Path</th>
                        <th className="py-3 px-4 text-left text-sm font-medium">Content Preview</th>
                        <th className="py-3 px-4 text-left text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOverrides.map((override) => (
                        <tr key={override.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 text-sm font-mono">{override.filePath}</td>
                          <td className="py-3 px-4 text-sm">
                            <code className="bg-muted px-2 py-1 rounded text-xs max-w-xs truncate block">
                              {override.content}
                            </code>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {applyOverrides ? (
                              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                                <Check className="h-3 w-3 mr-1" /> Will Apply
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                <X className="h-3 w-3 mr-1" /> Disabled
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                      
                      {filteredOverrides.length === 0 && overrideSearch && (
                        <tr>
                          <td colSpan={3} className="py-8 px-4 text-center text-muted-foreground">
                            No overrides match your search criteria
                          </td>
                        </tr>
                      )}
                      
                      {fileOverrides.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 px-4 text-center text-muted-foreground">
                            No file overrides found for this environment
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Action Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 text-white rounded-full">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Ready to Continue</h3>
                <p className="text-sm text-muted-foreground">
                  Review complete. Proceed to summary and generate your JAR.
                </p>
              </div>
            </div>
            <Button size="lg" onClick={handleGenerate} className="bg-green-600 hover:bg-green-700">
              Continue to Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewStep;
