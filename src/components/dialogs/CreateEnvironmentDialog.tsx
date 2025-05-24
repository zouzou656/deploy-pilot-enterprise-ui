
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { environmentService } from '@/services/environmentService';
import { CreateEnvironmentDto } from '@/types/project';

interface CreateEnvironmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  projectId: string;
}

const CreateEnvironmentDialog: React.FC<CreateEnvironmentDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  projectId
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEnvironmentDto>({
    projectId,
    name: '',
    host: '',
    port: 7001,
    username: '',
    password: '',
    deploymentChannel: '',
    isProduction: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await environmentService.createEnvironment(formData);
      toast({
        title: 'Environment created',
        description: 'The environment has been successfully created.'
      });
      onSuccess();
      onOpenChange(false);
      setFormData({
        projectId,
        name: '',
        host: '',
        port: 7001,
        username: '',
        password: '',
        deploymentChannel: '',
        isProduction: false
      });
    } catch (error: any) {
      toast({
        title: 'Error creating environment',
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
          <DialogTitle>Create New Environment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Environment Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Development, Testing, Production"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host *</Label>
              <Input
                id="host"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                placeholder="server.example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={formData.port || ''}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || undefined })}
                placeholder="7001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="weblogic"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deploymentChannel">Deployment Channel</Label>
            <Input
              id="deploymentChannel"
              value={formData.deploymentChannel}
              onChange={(e) => setFormData({ ...formData, deploymentChannel: e.target.value })}
              placeholder="Optional deployment channel"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isProduction"
              checked={formData.isProduction}
              onCheckedChange={(checked) => setFormData({ ...formData, isProduction: checked })}
            />
            <Label htmlFor="isProduction">Production Environment</Label>
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
              {isLoading ? 'Creating...' : 'Create Environment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEnvironmentDialog;
