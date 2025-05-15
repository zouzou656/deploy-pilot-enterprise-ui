
import React, { useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PageHeader from '@/components/ui-custom/PageHeader';
import { FileText, Download, RefreshCw } from 'lucide-react';
import useApiExplorerStore from '@/stores/apiExplorerStore';
import { useToast } from '@/hooks/use-toast';

const ApiExplorer: React.FC = () => {
  const {
    selectedBranch,
    branches,
    specUrl,
    isLoading,
    error,
    baseEndpoint,
    theme,
    remoteUrlOverride,
    fetchBranches,
    fetchOpenApiSpec,
    setSelectedBranch,
    setBaseEndpoint,
    setTheme,
    setRemoteUrlOverride
  } = useApiExplorerStore();
  
  const { toast } = useToast();

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (selectedBranch) {
      fetchOpenApiSpec();
    }
  }, [selectedBranch, fetchOpenApiSpec]);

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value);
  };

  const handleRefreshSpec = () => {
    fetchOpenApiSpec();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(specUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `openapi-spec-${selectedBranch}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download complete",
        description: `OpenAPI spec for ${selectedBranch} branch downloaded successfully.`,
      });
    } catch (error) {
      console.error('Error downloading spec:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the OpenAPI specification.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="API Explorer" 
        description="Browse and interact with OpenAPI specifications for your services"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branch-select">Git Branch</Label>
              <Select 
                value={selectedBranch}
                onValueChange={handleBranchChange}
                disabled={isLoading}
              >
                <SelectTrigger id="branch-select">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endpoint">Base API Endpoint</Label>
              <Input 
                id="endpoint" 
                value={baseEndpoint} 
                onChange={(e) => setBaseEndpoint(e.target.value)} 
                placeholder="/api/openapi" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remote-url">Remote URL Override (Optional)</Label>
              <Input 
                id="remote-url" 
                value={remoteUrlOverride} 
                onChange={(e) => setRemoteUrlOverride(e.target.value)} 
                placeholder="https://example.com/openapi.json" 
              />
              <p className="text-xs text-muted-foreground">
                When provided, this URL will be used instead of the base endpoint
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch 
                  id="dark-mode" 
                  checked={theme === 'dark'} 
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                />
              </div>
              <Button onClick={handleRefreshSpec} disabled={isLoading} size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
            
            <Button 
              onClick={handleDownload} 
              variant="outline" 
              className="w-full"
              disabled={!specUrl || isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Raw Spec
            </Button>
          </CardContent>
        </Card>
        
        {/* API Documentation */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            {error ? (
              <Alert variant="destructive" className="mb-4">
                <FileText className="h-4 w-4" />
                <AlertTitle>Error loading API specification</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center h-96">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Loading API specification...</p>
              </div>
            ) : specUrl ? (
              <div className={`swagger-wrapper ${theme === 'dark' ? 'swagger-dark' : ''}`}>
                <SwaggerUI url={specUrl} docExpansion="list" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No API Specification Selected</h3>
                <p className="text-muted-foreground">
                  Select a branch from the dropdown to load its OpenAPI specification.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiExplorer;
