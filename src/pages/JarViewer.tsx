
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  FileText, 
  Folder, 
  ArrowLeft, 
  Download,
  File,
  ChevronRight,
  Eye,
  Code,
  Archive
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Separator } from '@/components/ui/separator';
import CodeEditor from '@/components/ui-custom/CodeEditor';
import { useNavigate } from 'react-router-dom';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  size?: string;
}

const JarViewer = () => {
  const { jarName } = useParams<{ jarName: string }>();
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const navigate = useNavigate();
  
  // Mock file structure for an OSB JAR
  const jarStructure: FileNode = {
    name: jarName || 'unknown.jar',
    type: 'folder',
    path: '/',
    children: [
      {
        name: 'META-INF',
        type: 'folder',
        path: '/META-INF',
        children: [
          { name: 'MANIFEST.MF', type: 'file', path: '/META-INF/MANIFEST.MF', size: '1.2 KB' },
          { name: 'adf-config.xml', type: 'file', path: '/META-INF/adf-config.xml', size: '2.5 KB' },
          { name: 'weblogic-application.xml', type: 'file', path: '/META-INF/weblogic-application.xml', size: '1.8 KB' },
        ]
      },
      {
        name: 'OSB',
        type: 'folder',
        path: '/OSB',
        children: [
          { 
            name: 'CustomerAPI', 
            type: 'folder', 
            path: '/OSB/CustomerAPI',
            children: [
              { name: 'CustomerService.proxy', type: 'file', path: '/OSB/CustomerAPI/CustomerService.proxy', size: '4.5 KB' },
              { name: 'CustomerPipeline.pipeline', type: 'file', path: '/OSB/CustomerAPI/CustomerPipeline.pipeline', size: '8.2 KB' },
              { 
                name: 'resources', 
                type: 'folder', 
                path: '/OSB/CustomerAPI/resources',
                children: [
                  { name: 'CustomerService.wsdl', type: 'file', path: '/OSB/CustomerAPI/resources/CustomerService.wsdl', size: '12.4 KB' },
                  { name: 'CustomerTypes.xsd', type: 'file', path: '/OSB/CustomerAPI/resources/CustomerTypes.xsd', size: '5.7 KB' },
                ]
              },
            ]
          },
          { 
            name: 'PaymentAPI', 
            type: 'folder', 
            path: '/OSB/PaymentAPI',
            children: [
              { name: 'PaymentProcessor.proxy', type: 'file', path: '/OSB/PaymentAPI/PaymentProcessor.proxy', size: '3.8 KB' },
              { name: 'PaymentPipeline.pipeline', type: 'file', path: '/OSB/PaymentAPI/PaymentPipeline.pipeline', size: '7.5 KB' },
              { 
                name: 'resources', 
                type: 'folder', 
                path: '/OSB/PaymentAPI/resources',
                children: [
                  { name: 'PaymentService.wsdl', type: 'file', path: '/OSB/PaymentAPI/resources/PaymentService.wsdl', size: '10.2 KB' },
                  { name: 'PaymentTypes.xsd', type: 'file', path: '/OSB/PaymentAPI/resources/PaymentTypes.xsd', size: '4.9 KB' },
                ]
              },
            ]
          }
        ]
      },
      {
        name: 'config',
        type: 'folder',
        path: '/config',
        children: [
          { name: 'servicebus-config.xml', type: 'file', path: '/config/servicebus-config.xml', size: '6.3 KB' },
          { name: 'operational-settings.xml', type: 'file', path: '/config/operational-settings.xml', size: '3.1 KB' },
          { name: 'alert-destinations.xml', type: 'file', path: '/config/alert-destinations.xml', size: '2.2 KB' },
        ]
      }
    ]
  };
  
  useEffect(() => {
    document.title = `JAR Viewer - ${jarName}`;
  }, [jarName]);

  // Navigate the folder structure
  const navigateToPath = (path: string[]) => {
    setCurrentPath(path);
    setSelectedFile(null);
  };

  // Get current directory
  const getCurrentDir = (): FileNode => {
    let current = jarStructure;
    
    for (const segment of currentPath) {
      const child = current.children?.find(c => c.name === segment);
      if (child && child.type === 'folder') {
        current = child;
      } else {
        break;
      }
    }
    
    return current;
  };

  // View file content
  const viewFile = (file: FileNode) => {
    setSelectedFile(file);
    
    // Generate mock content based on file extension
    let content = '';
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'xml':
      case 'wsdl':
        content = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- ${file.name} -->\n<definitions name="${file.name.split('.')[0]}" targetNamespace="http://example.com/${file.name.split('.')[0]}">\n  <types>\n    <schema>\n      <!-- Type definitions -->\n    </schema>\n  </types>\n  <message name="Request">\n    <part name="parameters" element="tns:RequestType" />\n  </message>\n  <message name="Response">\n    <part name="parameters" element="tns:ResponseType" />\n  </message>\n  <portType name="${file.name.split('.')[0]}PortType">\n    <operation name="process">\n      <input message="tns:Request" />\n      <output message="tns:Response" />\n    </operation>\n  </portType>\n  <!-- Service and binding definitions -->\n</definitions>`;
        break;
      case 'xsd':
        content = `<?xml version="1.0" encoding="UTF-8"?>\n<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" targetNamespace="http://example.com/types">\n  <xs:element name="RequestType">\n    <xs:complexType>\n      <xs:sequence>\n        <xs:element name="id" type="xs:string" />\n        <xs:element name="value" type="xs:string" />\n      </xs:sequence>\n    </xs:complexType>\n  </xs:element>\n  <xs:element name="ResponseType">\n    <xs:complexType>\n      <xs:sequence>\n        <xs:element name="result" type="xs:string" />\n        <xs:element name="status" type="xs:string" />\n      </xs:sequence>\n    </xs:complexType>\n  </xs:element>\n</xs:schema>`;
        break;
      case 'proxy':
        content = `<?xml version="1.0" encoding="UTF-8"?>\n<con:businessServiceEntry xmlns:con="http://www.bea.com/wli/sb/services/business/config">\n  <con:coreEntry>\n    <con:description>${file.name.split('.')[0]} Service</con:description>\n    <con:binding type="SOAP" isSoap12="false" xsi:type="con:SoapBindingType"/>\n    <con:operations>\n      <con:operation>\n        <con:name>process</con:name>\n        <con:messaging>\n          <con:request-response>\n            <con:request>RequestMessage</con:request>\n            <con:response>ResponseMessage</con:response>\n          </con:request-response>\n        </con:messaging>\n      </con:operation>\n    </con:operations>\n    <!-- Additional configuration -->\n  </con:coreEntry>\n</con:businessServiceEntry>`;
        break;
      case 'pipeline':
        content = `<?xml version="1.0" encoding="UTF-8"?>\n<con:pipelineEntry xmlns:con="http://www.bea.com/wli/sb/pipeline/config">\n  <con:coreEntry>\n    <con:description>${file.name.split('.')[0]} Pipeline</con:description>\n  </con:coreEntry>\n  <con:router errorHandler="error-handler">\n    <con:pipeline name="request">\n      <con:stage name="validate">\n        <con:context/>\n        <con:actions>\n          <con1:validate xmlns:con1="http://www.bea.com/wli/sb/stages/transform/config">\n            <!-- Validation configuration -->\n          </con1:validate>\n        </con:actions>\n      </con:stage>\n      <!-- Additional stages -->\n    </con:pipeline>\n    <con:pipeline name="response">\n      <!-- Response handling -->\n    </con:pipeline>\n    <!-- Error handling -->\n  </con:router>\n</con:pipelineEntry>`;
        break;
      case 'mf':
        content = `Manifest-Version: 1.0\nCreated-By: Apache Maven\nBuilt-By: CI/CD\nBuild-Jdk: 11.0.15\nImplementation-Title: ${jarName?.split('.')[0] || 'OSB Integration'}\nImplementation-Version: 1.0.0\nImplementation-Vendor: Example Corp`;
        break;
      default:
        content = `// Content for ${file.name}\n// This is a mock representation of the file content`;
        break;
    }
    
    setFileContent(content);
  };

  // Get file type icon
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'xml':
      case 'wsdl':
      case 'xsd':
        return <Code className="h-4 w-4 mr-2 text-blue-500" />;
      case 'proxy':
      case 'pipeline':
        return <Eye className="h-4 w-4 mr-2 text-purple-500" />;
      case 'jar':
        return <Archive className="h-4 w-4 mr-2 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 mr-2 text-muted-foreground" />;
    }
  };

  // Determine file language for syntax highlighting
  const getFileLanguage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'xml':
      case 'wsdl':
      case 'xsd':
      case 'proxy':
      case 'pipeline':
        return 'xml';
      case 'json':
        return 'json';
      case 'java':
        return 'java';
      case 'js':
        return 'javascript';
      default:
        return 'plaintext';
    }
  };

  const breadcrumbs = [
    { name: jarName || 'JAR', path: [] },
    ...currentPath.map((segment, index) => ({
      name: segment,
      path: currentPath.slice(0, index + 1)
    }))
  ];

  const currentDir = getCurrentDir();

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`JAR Viewer - ${jarName}`} 
        description="Browse and inspect the contents of an OSB JAR file"
      />
      
      <div className="flex gap-2 items-center mb-4 overflow-x-auto py-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/jar-generation')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to JAR Generation
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => navigateToPath(crumb.path)}
            >
              {index === 0 ? (
                <Package className="h-4 w-4 mr-1" />
              ) : (
                <Folder className="h-4 w-4 mr-1" />
              )}
              {crumb.name}
            </Button>
            {index < breadcrumbs.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              JAR Contents
            </CardTitle>
            <CardDescription>
              Browse the file structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <div className="divide-y">
                {currentPath.length > 0 && (
                  <div 
                    className="p-2 hover:bg-muted/50 cursor-pointer flex items-center"
                    onClick={() => navigateToPath(currentPath.slice(0, -1))}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    <span>Parent Directory</span>
                  </div>
                )}
                
                {currentDir.children?.map((item) => (
                  <div 
                    key={item.path} 
                    className="p-2 hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      if (item.type === 'folder') {
                        navigateToPath([...currentPath, item.name]);
                      } else {
                        viewFile(item);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      {item.type === 'folder' ? (
                        <Folder className="h-4 w-4 mr-2 text-blue-500" />
                      ) : (
                        getFileIcon(item.name)
                      )}
                      <span className="flex-1 truncate">{item.name}</span>
                      {item.size && (
                        <span className="text-xs text-muted-foreground">{item.size}</span>
                      )}
                    </div>
                  </div>
                ))}

                {(currentDir.children?.length || 0) === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    Empty directory
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getFileIcon(selectedFile.name)}
                    <span>{selectedFile.name}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              ) : (
                'File Viewer'
              )}
            </CardTitle>
            <CardDescription>
              {selectedFile ? (
                <span>Viewing file content {selectedFile.size && `(${selectedFile.size})`}</span>
              ) : (
                'Select a file to view its contents'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedFile ? (
              <div className="border rounded-md overflow-hidden h-[60vh]">
                <CodeEditor
                  value={fileContent}
                  language={getFileLanguage(selectedFile.name)}
                  readOnly={true}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground border rounded-md">
                <File className="h-16 w-16 mb-4 opacity-30" />
                <p>Select a file from the JAR to view its contents</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JarViewer;
