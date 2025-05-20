
import React, { useState } from 'react';
import { Eye, Maximize2, Check, X } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Eye className="inline-block mr-2 cursor-pointer"/>
            </TooltipTrigger>
            <TooltipContent side="top">Preview &amp; Generate</TooltipContent>
          </Tooltip>
          Preview &amp; Generate
        </CardTitle>
        <CardDescription>
          Review your changes and apply file overrides before generating the JAR
        </CardDescription>
      </CardHeader>

      <CardContent>
        {previewTabDisabled ? (
          <div className="p-6 text-center text-muted-foreground">
            <p>Preview not available in manual mode. All files are taken from the latest commit.</p>
          </div>
        ) : (
          <>
            {/* Commits selector */}
            <div className="flex items-center gap-4 mb-4">
              <Label>
                To:
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Eye className="inline-block mr-2 cursor-pointer"/>
                  </TooltipTrigger>
                  <TooltipContent side="top">Fixed HEAD Commit</TooltipContent>
                </Tooltip>
                Fixed HEAD Commit
              </Label>
              <span className="font-mono">{initialHead.slice(0, 7)}</span>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <Label>
                From:
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Eye className="inline-block mr-2 cursor-pointer"/>
                  </TooltipTrigger>
                  <TooltipContent side="top">Choose a different base for preview only</TooltipContent>
                </Tooltip>
                Choose a different base for preview only
              </Label>
              <select
                className="p-2 border rounded bg-white text-gray-900
                         dark:bg-gray-800 dark:text-gray-100
                         border-gray-300 dark:border-gray-700
                         focus:ring-2 focus:ring-blue-500"
                value={previewBase}
                onChange={(e) => setPreviewBase(e.target.value)}
              >
                {loadingCommits
                  ? <option>Loading…</option>
                  : commits.map(c => (
                    <option key={c.sha} value={c.sha}>
                      {c.sha.slice(0, 7)} — {c.message}
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="flex gap-4">
              {/* Files */}
              <div className="w-1/3">
                <h3 className="font-semibold mb-2">Files</h3>
                <ScrollArea className="h-72 p-2 border rounded">
                  <TreeView
                    nodes={previewTree}
                    expanded={previewExpanded}
                    onToggle={p => toggleExp(true, p)}
                    selected={selectedFiles}
                    toggleFile={() => {}}
                    onHighlight={f => setHighlighted(f)}
                  />
                </ScrollArea>
              </div>

              {/* Diff + Expand */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Diff</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="outline" aria-label="Expand diff">
                        <Maximize2 className="h-5 w-5"/>
                      </Button>
                    </DialogTrigger>

                    <DialogContent
                      className="
                        fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                        bg-white dark:bg-gray-900 rounded-2xl shadow-lg
                        w-[90vw] max-w-[1200px]
                        max-h-[90vh]
                        overflow-auto
                        flex flex-col
                      "
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-6 py-4 border-b">
                        <DialogTitle className="text-xl font-semibold">
                          File Diff Preview
                        </DialogTitle>
                        <DialogClose aria-label="Close" className="text-gray-500 hover:text-gray-700"/>
                      </div>

                      {/* Body */}
                      <div
                        className="
                          flex-1 h-72 overflow-auto border rounded p-4
                          bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100
                          /* force added/removed lines to use normal text color */
                          [&_.dv-content-add]:text-gray-900 dark:[&_.dv-content-add]:text-gray-100
                          [&_.dv-content-del]:text-gray-900 dark:[&_.dv-content-del]:text-gray-100
                        "
                      >
                        {highlighted ? (
                          <DiffViewer {...highlighted} />
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">
                            Select a file to view its diff
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex-1 h-72 overflow-auto border rounded p-4 bg-white text-gray-900
                              dark:bg-gray-800 dark:text-gray-100
                              border-gray-300 dark:border-gray-700
                              focus:ring-2 focus:ring-blue-500">
                  {highlighted
                    ? <DiffViewer {...highlighted} />
                    : <p className="text-gray-500 dark:text-gray-400">
                      Select a file to view its diff
                    </p>
                  }
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* File Overrides Section */}
        {environmentId && fileOverrides.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">File Overrides</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="applyOverrides"
                  checked={applyOverrides}
                  onCheckedChange={setApplyOverrides}
                />
                <Label htmlFor="applyOverrides">Apply Overrides</Label>
              </div>
            </div>
            
            <ScrollArea className="h-48 border rounded">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="py-2 px-3 text-left text-sm font-medium">Filename</th>
                    <th className="py-2 px-3 text-left text-sm font-medium">Type</th>
                    <th className="py-2 px-3 text-left text-sm font-medium">Original Value</th>
                    <th className="py-2 px-3 text-left text-sm font-medium">Override Value</th>
                    <th className="py-2 px-3 text-left text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fileOverrides.map((override) => (
                    <tr key={override.id} className="border-t">
                      <td className="py-2 px-3 text-sm">{override.filename}</td>
                      <td className="py-2 px-3 text-sm">{override.fileType}</td>
                      <td className="py-2 px-3 text-sm font-mono">{override.originalValue}</td>
                      <td className="py-2 px-3 text-sm font-mono">{override.overrideValue}</td>
                      <td className="py-2 px-3 text-sm">
                        {applyOverrides ? (
                          <span className="flex items-center text-green-600">
                            <Check className="h-4 w-4 mr-1" /> Will Apply
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <X className="h-4 w-4 mr-1" /> Not Applied
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {fileOverrides.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 px-3 text-center text-muted-foreground">
                        No file overrides found for this environment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        )}
        
        <div className="flex justify-end mt-6">
          <Button size="lg" onClick={handleGenerate}>
            Continue to Summary
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreviewStep;
