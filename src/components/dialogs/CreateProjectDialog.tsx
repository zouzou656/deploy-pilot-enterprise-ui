
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { projectService } from '@/services/projectService';
import { CreateProjectDto } from '@/types/project';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProjectDto>({
    name: '',
    description: '',
    gitRepoUrl: '',
    gitUsername: '',
    gitPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await projectService.createProject(formData);
      toast({
        title: 'Project created',
        description: 'The project has been successfully created.'
      });
      onSuccess();
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        gitRepoUrl: '',
        gitUsername: '',
        gitPassword: ''
      });
    } catch (error: any) {
      toast({
        title: 'Error creating project',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gitRepoUrl">Git Repository URL *</Label>
            <Input
              id="gitRepoUrl"
              value={formData.gitRepoUrl}
              onChange={(e) => setFormData({ ...formData, gitRepoUrl: e.target.value })}
              placeholder="https://github.com/user/repo.git"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gitUsername">Git Username</Label>
            <Input
              id="gitUsername"
              value={formData.gitUsername}
              onChange={(e) => setFormData({ ...formData, gitUsername: e.target.value })}
              placeholder="Git username (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gitPassword">Git Password</Label>
            <Input
              id="gitPassword"
              type="password"
              value={formData.gitPassword}
              onChange={(e) => setFormData({ ...formData, gitPassword: e.target.value })}
              placeholder="Git password or token (optional)"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
