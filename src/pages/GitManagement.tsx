import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from '@/hooks/use-toast';
import { Commit } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Diff, Hunk } from 'react-diff-view';
import 'react-diff-view/style/index.css';
import { useProject } from '@/contexts/ProjectContext';
import { gitService } from '@/services/gitService';

interface FileDiffContent {
  hunks: Hunk[];
  tokens: string[];
}

const GitManagement = () => {
  const [commitSha, setCommitSha] = useState<string>('');
  const [fileDiffContent, setFileDiffContent] = useState<FileDiffContent | null>(null);
  const { toast } = useToast();
  const { selectedProject } = useProject();

  const { data: branches, isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches', selectedProject?.id],
    enabled: !!selectedProject?.id,
    queryFn: async () => {
      if (!selectedProject?.id) return [];
      return await gitService.getBranches(selectedProject.id);
    }
  });

  const { data: commits, isLoading: isLoadingCommits } = useQuery({
    queryKey: ['commits', selectedProject?.id, branches?.[0]],
    enabled: !!selectedProject?.id && !!branches?.[0],
    queryFn: async () => {
      if (!selectedProject?.id || !branches?.[0]) return [];
      const commitData = await gitService.getCommits(selectedProject.id, branches[0]);
      return commitData;
    }
  });

  const handleCommitShaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommitSha(event.target.value);
  };

  const handleFetchDiff = async () => {
    if (!selectedProject?.id) {
      toast({
        title: "No project selected",
        description: "Please select a project to fetch commit details.",
        variant: "destructive",
      });
      return;
    }

    if (!commitSha) {
      toast({
        title: "No commit SHA provided",
        description: "Please enter a commit SHA to fetch details.",
        variant: "destructive",
      });
      return;
    }

    try {
      const commitDetail = await gitService.getCommitDetail(selectedProject.id, commitSha);

      if (commitDetail && commitDetail.files) {
        // Process the file changes to extract hunks and tokens
        const diffContent = commitDetail.files.map(file => {
          if (file.patch) {
            const hunks = Diff.parseUnifiedDiff(file.patch)[0]?.hunks || [];
            const tokens = hunks.flatMap(hunk => hunk.lines.map(line => line.content));
            return { file: file.filename, hunks, tokens };
          }
          return null;
        }).filter(Boolean);

        // For simplicity, taking the first file's diff content
        if (diffContent && diffContent.length > 0) {
          setFileDiffContent({
            hunks: diffContent[0].hunks,
            tokens: diffContent[0].tokens,
          });
        } else {
          setFileDiffContent(null);
          toast({
            title: "No diff content available",
            description: "The commit does not contain any diff information.",
          });
        }
      } else {
        setFileDiffContent(null);
        toast({
          title: "Commit details not found",
          description: "Failed to fetch commit details. Please check the commit SHA.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching commit details:", error);
      setFileDiffContent(null);
      toast({
        title: "Error fetching commit details",
        description: "Failed to fetch commit details. Please check the commit SHA and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Git Management</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Fetch Commit Details</CardTitle>
          <CardDescription>Enter a commit SHA to view its details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-[150px_1fr] items-center gap-4">
            <Label htmlFor="commit-sha">Commit SHA</Label>
            <Input
              id="commit-sha"
              value={commitSha}
              onChange={handleCommitShaChange}
              className="h-9"
            />
          </div>
          <Button onClick={handleFetchDiff}>Fetch Details</Button>
        </CardContent>
      </Card>

      {fileDiffContent && (
        <div className="border rounded-md overflow-auto bg-white dark:bg-gray-950 text-sm">
          <Diff
            viewType="split"
            diffType="modify"
            hunks={fileDiffContent.hunks}
            tokens={fileDiffContent.tokens}
          />
        </div>
      )}
    </div>
  );
};

export default GitManagement;
