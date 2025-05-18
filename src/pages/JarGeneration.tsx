
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ChevronRight, 
  FileSearch, 
  GitCommit, 
  Files, 
  FileInput, 
  Check 
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/ui-custom/PageHeader';
import useDeploymentStore from '@/stores/deploymentStore';
import { ScrollArea } from '@/components/ui/scroll-area';

const JarGeneration = () => {
  const [selectedProject, setSelectedProject] = useState('OSB Main Integration');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [version, setVersion] = useState('1.0.0');
  const [selectedStrategy, setSelectedStrategy] = useState('manual');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateJar } = useDeploymentStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const projects = [
    'OSB Main Integration',
    'Customer API',
    'Payment Service',
    'Order Processing',
    'Inventory Management'
  ];

  const branches = [
    'main',
    'develop',
    'feature/payment-gateway',
    'feature/customer-api-v2',
    'hotfix/security-patch'
  ];

  const availableFiles = [
    'src/main/CustomerService.java',
    'src/main/PaymentProcessor.java',
    'src/main/OrderFlow.java',
    'src/resources/wsdl/CustomerService.wsdl',
    'src/resources/xsd/CustomerTypes.xsd',
    'src/resources/xsd/PaymentTypes.xsd',
    'config/weblogic-config.xml',
    'config/deployment.properties'
  ];

  const commits = [
    { id: 'abc1234', message: 'Implement customer lookup API', date: '2023-05-15' },
    { id: 'def5678', message: 'Fix payment gateway integration', date: '2023-05-14' },
    { id: 'ghi9012', message: 'Update WSDL definitions', date: '2023-05-13' },
    { id: 'jkl3456', message: 'Add order status endpoint', date: '2023-05-12' },
    { id: 'mno7890', message: 'Security patch for authentication', date: '2023-05-11' }
  ];

  const recentJars = [
    { name: 'integration-1.0.0.jar', date: 'May 15, 2023', size: '4.2 MB' },
    { name: 'integration-0.9.0.jar', date: 'May 14, 2023', size: '4.0 MB' },
    { name: 'integration-0.8.5.jar', date: 'May 13, 2023', size: '3.8 MB' }
  ];

  const handleFileToggle = (file: string) => {
    setSelectedFiles(prev => 
      prev.includes(file)
        ? prev.filter(f => f !== file)
        : [...prev, file]
    );
  };

  const handleCommitToggle = (commitId: string) => {
    setSelectedCommits(prev => 
      prev.includes(commitId)
        ? prev.filter(id => id !== commitId)
        : [...prev, commitId]
    );
  };

  const handleGenerateJar = async () => {
    setIsGenerating(true);
    
    // Simulate generating the JAR
    try {
      await generateJar(selectedProject, selectedBranch);
      
      toast({
        title: "JAR Generation Successful",
        description: `${selectedProject} JAR v${version} has been generated successfully.`,
      });
      
      // Optional: Navigate to the jar viewer with the new jar name
      navigate(`/jar-viewer/${encodeURIComponent(`${selectedProject.toLowerCase().replace(/\s+/g, '-')}-${version}.jar`)}`);
    } catch (error) {
      toast({
        title: "JAR Generation Failed",
        description: "There was an error generating the JAR. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewJar = (jarName: string) => {
    // Navigate to the jar viewer page with the jar name as a parameter
    navigate(`/jar-viewer/${encodeURIComponent(jarName)}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="JAR Generation" 
        description="Generate and manage Oracle Service Bus JAR files for deployment"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Generate New JAR
            </CardTitle>
            <CardDescription>Configure and build a new JAR package</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="project">Project</Label>
                <select 
                  id="project" 
                  className="w-full p-2 border rounded bg-background" 
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground">Select the OSB project to package</p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="branch">Branch</Label>
                <select 
                  id="branch" 
                  className="w-full p-2 border rounded bg-background" 
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground">Select the Git branch to build from</p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="version">Version</Label>
                <input 
                  id="version" 
                  type="text" 
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full p-2 border rounded bg-background" 
                  placeholder="1.0.0"
                />
                <p className="text-sm text-muted-foreground">Semantic version for this release</p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">File Selection Strategy</Label>
                <RadioGroup 
                  value={selectedStrategy} 
                  onValueChange={setSelectedStrategy}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="flex items-center cursor-pointer">
                      <FileInput className="h-4 w-4 mr-2" />
                      Manual file selection
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                    <RadioGroupItem value="recent" id="recent" />
                    <Label htmlFor="recent" className="flex items-center cursor-pointer">
                      <Files className="h-4 w-4 mr-2" />
                      All files from latest commit
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                    <RadioGroupItem value="commits" id="commits" />
                    <Label htmlFor="commits" className="flex items-center cursor-pointer">
                      <GitCommit className="h-4 w-4 mr-2" />
                      Choose specific commits
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {selectedStrategy === 'manual' && (
                <div className="space-y-3 border rounded-md p-3 bg-muted/20">
                  <Label className="text-base">Files to Include</Label>
                  <ScrollArea className="h-[200px] rounded p-1">
                    <div className="space-y-2 p-2">
                      {availableFiles.map((file) => (
                        <div key={file} className="flex items-center space-x-2 px-2 py-1.5 hover:bg-muted/50 rounded">
                          <Checkbox 
                            id={`file-${file}`} 
                            checked={selectedFiles.includes(file)}
                            onCheckedChange={() => handleFileToggle(file)}
                          />
                          <Label htmlFor={`file-${file}`} className="text-sm cursor-pointer">{file}</Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{selectedFiles.length} files selected</span>
                    <span>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto"
                        onClick={() => setSelectedFiles(availableFiles)}
                      >
                        Select all
                      </Button>
                      {" | "}
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto"
                        onClick={() => setSelectedFiles([])}
                      >
                        Clear
                      </Button>
                    </span>
                  </div>
                </div>
              )}
              
              {selectedStrategy === 'commits' && (
                <div className="space-y-3 border rounded-md p-3 bg-muted/20">
                  <Label className="text-base">Commits to Include</Label>
                  <ScrollArea className="h-[200px] rounded p-1">
                    <div className="space-y-2">
                      {commits.map((commit) => (
                        <div key={commit.id} className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded border-b last:border-0">
                          <Checkbox 
                            id={`commit-${commit.id}`} 
                            checked={selectedCommits.includes(commit.id)}
                            onCheckedChange={() => handleCommitToggle(commit.id)}
                            className="mt-0.5"
                          />
                          <div>
                            <Label htmlFor={`commit-${commit.id}`} className="font-mono text-xs">{commit.id}</Label>
                            <p className="text-sm">{commit.message}</p>
                            <p className="text-xs text-muted-foreground">{commit.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              <Button 
                onClick={handleGenerateJar} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating JAR...
                  </span>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" />
                    Generate JAR
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Recent JARs
            </CardTitle>
            <CardDescription>Previously generated JAR packages</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {recentJars.map((jar) => (
                  <div key={jar.name} className="flex justify-between items-center p-3 border rounded hover:bg-muted/40 transition-colors">
                    <div className="space-y-1">
                      <p className="font-medium flex items-center">
                        <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                        {jar.name}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <span>{jar.date}</span>
                        <span>•</span>
                        <span>{jar.size}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewJar(jar.name)}
                      >
                        <FileSearch className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JarGeneration;
