
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Check, 
  AlertTriangle, 
  X, 
  Clock, 
  Package, 
  Server,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageHeader from '@/components/ui-custom/PageHeader';
import TerminalConsole from '@/components/ui-custom/TerminalConsole';

interface LogEntry {
  id: string;
  type: string;
  status: string;
  date: string;
  target: string;
  user: string;
  description: string;
  details?: {
    logs: { time: string; message: string; level: string }[];
    environment?: string;
    duration?: string;
    startTime?: string;
    endTime?: string;
    version?: string;
    artifacts?: string[];
  }
}

const LogsHistory = () => {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [openLog, setOpenLog] = useState<string | null>(null);

  // Sample log data
  const logs: LogEntry[] = [
    { 
      id: 'deploy-1', 
      type: 'deploy', 
      status: 'success', 
      date: 'May 15, 2023 - 14:32', 
      target: 'Development Server', 
      user: 'admin', 
      description: 'OSB Integration deployed successfully',
      details: {
        environment: 'Development',
        duration: '2m 34s',
        startTime: '2023-05-15 14:30:12',
        endTime: '2023-05-15 14:32:46',
        version: '1.0.0',
        artifacts: ['osb-integration-1.0.0.jar'],
        logs: [
          { time: '14:30:12', level: 'INFO', message: 'Starting deployment process' },
          { time: '14:30:15', level: 'INFO', message: 'Connected to WebLogic server dev-weblogic.example.com:7001' },
          { time: '14:30:20', level: 'INFO', message: 'Uploading artifacts' },
          { time: '14:31:05', level: 'INFO', message: 'Artifacts uploaded successfully' },
          { time: '14:31:10', level: 'INFO', message: 'Deploying OSB components' },
          { time: '14:31:30', level: 'INFO', message: 'CustomerAPI deployed' },
          { time: '14:31:45', level: 'INFO', message: 'PaymentAPI deployed' },
          { time: '14:32:00', level: 'INFO', message: 'OrderAPI deployed' },
          { time: '14:32:25', level: 'INFO', message: 'Running post-deployment tests' },
          { time: '14:32:40', level: 'INFO', message: 'Health checks passed' },
          { time: '14:32:46', level: 'INFO', message: 'Deployment completed successfully' }
        ]
      }
    },
    { 
      id: 'build-1', 
      type: 'build', 
      status: 'error', 
      date: 'May 15, 2023 - 13:45', 
      target: 'JAR Generation', 
      user: 'developer', 
      description: 'Build failed due to compilation errors',
      details: {
        duration: '1m 12s',
        startTime: '2023-05-15 13:44:05',
        endTime: '2023-05-15 13:45:17',
        version: '1.0.0',
        logs: [
          { time: '13:44:05', level: 'INFO', message: 'Starting build process' },
          { time: '13:44:10', level: 'INFO', message: 'Compiling OSB artifacts' },
          { time: '13:44:30', level: 'WARNING', message: 'Potential WSDL reference issue detected' },
          { time: '13:44:45', level: 'ERROR', message: 'CustomerTypes.xsd: Element "Customer" referenced but not defined' },
          { time: '13:45:00', level: 'ERROR', message: 'Failed to compile CustomerAPI' },
          { time: '13:45:17', level: 'ERROR', message: 'Build process failed with errors' }
        ]
      }
    },
    { 
      id: 'git-1', 
      type: 'git', 
      status: 'success', 
      date: 'May 15, 2023 - 11:20', 
      target: 'main branch', 
      user: 'developer', 
      description: 'Successfully pulled latest changes',
      details: {
        duration: '0m 15s',
        startTime: '2023-05-15 11:20:05',
        endTime: '2023-05-15 11:20:20',
        logs: [
          { time: '11:20:05', level: 'INFO', message: 'Git pull initiated for main branch' },
          { time: '11:20:10', level: 'INFO', message: 'Fetching origin' },
          { time: '11:20:15', level: 'INFO', message: 'Merging changes' },
          { time: '11:20:20', level: 'INFO', message: 'Successfully updated repository. 3 files changed, 45 insertions(+), 12 deletions(-)' }
        ]
      }
    },
    { 
      id: 'deploy-2', 
      type: 'deploy', 
      status: 'warning', 
      date: 'May 14, 2023 - 16:05', 
      target: 'Testing Server', 
      user: 'admin', 
      description: 'Deployment completed with warnings',
      details: {
        environment: 'Testing',
        duration: '3m 22s',
        startTime: '2023-05-14 16:02:00',
        endTime: '2023-05-14 16:05:22',
        version: '0.9.0',
        artifacts: ['osb-integration-0.9.0.jar'],
        logs: [
          { time: '16:02:00', level: 'INFO', message: 'Starting deployment process to Testing environment' },
          { time: '16:02:15', level: 'INFO', message: 'Connected to WebLogic server test-weblogic.example.com:7001' },
          { time: '16:02:25', level: 'INFO', message: 'Uploading artifacts' },
          { time: '16:03:10', level: 'INFO', message: 'Artifacts uploaded successfully' },
          { time: '16:03:20', level: 'INFO', message: 'Deploying OSB components' },
          { time: '16:03:45', level: 'INFO', message: 'CustomerAPI deployed' },
          { time: '16:04:05', level: 'INFO', message: 'PaymentAPI deployed' },
          { time: '16:04:25', level: 'WARNING', message: 'Timeout during OrderAPI deployment, retrying' },
          { time: '16:04:50', level: 'INFO', message: 'OrderAPI deployed after retry' },
          { time: '16:05:10', level: 'WARNING', message: 'Health check: OrderAPI response time exceeds threshold (1.5s)' },
          { time: '16:05:22', level: 'INFO', message: 'Deployment completed with warnings' }
        ]
      }
    },
    { 
      id: 'build-2', 
      type: 'build', 
      status: 'success', 
      date: 'May 14, 2023 - 14:30', 
      target: 'JAR Generation', 
      user: 'developer', 
      description: 'Successfully built JAR file',
      details: {
        duration: '1m 45s',
        startTime: '2023-05-14 14:29:00',
        endTime: '2023-05-14 14:30:45',
        version: '0.9.0',
        artifacts: ['osb-integration-0.9.0.jar'],
        logs: [
          { time: '14:29:00', level: 'INFO', message: 'Starting build process' },
          { time: '14:29:10', level: 'INFO', message: 'Compiling OSB artifacts' },
          { time: '14:29:45', level: 'INFO', message: 'CustomerAPI compiled' },
          { time: '14:30:05', level: 'INFO', message: 'PaymentAPI compiled' },
          { time: '14:30:25', level: 'INFO', message: 'OrderAPI compiled' },
          { time: '14:30:35', level: 'INFO', message: 'Packaging JAR file' },
          { time: '14:30:45', level: 'INFO', message: 'Build completed successfully: osb-integration-0.9.0.jar' }
        ]
      }
    },
  ];

  // Helper for status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  // Helper for operation icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deploy':
        return <Server className="h-5 w-5" />;
      case 'build':
        return <Package className="h-5 w-5" />;
      case 'git':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21h6z"></path><path d="M9 19c-4.3 1.4-4.3-2.5-6-3"></path></svg>;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-200 dark:border-green-800">Success</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800">Warning</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 border-red-200 dark:border-red-800">Error</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800">In Progress</Badge>;
    }
  };

  const toggleLogDetails = (id: string) => {
    setOpenLog(openLog === id ? null : id);
  };

  const openLogDetails = (log: LogEntry) => {
    setSelectedLog(log);
  };

  const logRows = {
    'INFO': 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30',
    'WARNING': 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30',
    'ERROR': 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30',
    'DEBUG': 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30',
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Logs & History" 
        description="View detailed records of deployments, builds, and system operations"
      />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Operation History</CardTitle>
            <CardDescription>Recent system activities and their outcomes</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border rounded hover:bg-muted/40 transition-colors">
                <div 
                  className="flex items-start gap-4 p-4 cursor-pointer"
                  onClick={() => toggleLogDetails(log.id)}
                >
                  <div className={`h-8 w-8 flex items-center justify-center rounded-full ${
                    log.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                    log.status === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    log.status === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {getStatusIcon(log.status)}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium flex items-center gap-2">
                        {getTypeIcon(log.type)}
                        {log.description}
                      </h4>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.status)}
                        <span className="text-xs text-muted-foreground hidden sm:inline">{log.date}</span>
                        {openLog === log.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Target:</span> {log.target}
                      </div>
                      <div>
                        <span className="text-muted-foreground">User:</span> {log.user}
                      </div>
                      <div className="sm:hidden">
                        <span className="text-muted-foreground">Date:</span> {log.date}
                      </div>
                    </div>
                  </div>
                </div>
                
                {openLog === log.id && (
                  <div className="px-4 pb-4">
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      {log.details && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            {log.details.environment && (
                              <div>
                                <span className="font-medium">Environment:</span> {log.details.environment}
                              </div>
                            )}
                            {log.details.duration && (
                              <div>
                                <span className="font-medium">Duration:</span> {log.details.duration}
                              </div>
                            )}
                            {log.details.version && (
                              <div>
                                <span className="font-medium">Version:</span> {log.details.version}
                              </div>
                            )}
                            {log.details.artifacts && log.details.artifacts.length > 0 && (
                              <div>
                                <span className="font-medium">Artifacts:</span> {log.details.artifacts.join(', ')}
                              </div>
                            )}
                          </div>

                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openLogDetails(log);
                            }}
                            className="mt-2"
                          >
                            View Details <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Log detail dialog */}
      <Dialog open={selectedLog !== null} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getTypeIcon(selectedLog.type)}
              {selectedLog?.description}
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between">
              <span>{selectedLog?.date} • {selectedLog?.target}</span>
              {selectedLog && getStatusBadge(selectedLog.status)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <Tabs defaultValue="logs" className="flex-1 flex flex-col overflow-hidden">
              <TabsList>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="terminal">Terminal View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="logs" className="flex-1 overflow-hidden">
                <ScrollArea className="h-[60vh]">
                  <div className="space-y-1 p-1">
                    {selectedLog.details?.logs.map((log, idx) => (
                      <div 
                        key={idx} 
                        className={`px-2 py-1 rounded text-sm font-mono flex ${logRows[log.level as keyof typeof logRows] || ''}`}
                      >
                        <span className="inline-block w-16">{log.time}</span>
                        <span className="inline-block w-16 font-semibold">{log.level}</span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Operation Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Operation ID:</span> {selectedLog.id}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {selectedLog.type}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {selectedLog.status}
                        </div>
                        <div>
                          <span className="font-medium">Triggered By:</span> {selectedLog.user}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {selectedLog.details?.environment && (
                          <div>
                            <span className="font-medium">Environment:</span> {selectedLog.details.environment}
                          </div>
                        )}
                        {selectedLog.details?.startTime && (
                          <div>
                            <span className="font-medium">Start Time:</span> {selectedLog.details.startTime}
                          </div>
                        )}
                        {selectedLog.details?.endTime && (
                          <div>
                            <span className="font-medium">End Time:</span> {selectedLog.details.endTime}
                          </div>
                        )}
                        {selectedLog.details?.duration && (
                          <div>
                            <span className="font-medium">Duration:</span> {selectedLog.details.duration}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedLog.details?.artifacts && selectedLog.details.artifacts.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Artifacts:</h4>
                        <div className="space-y-2">
                          {selectedLog.details.artifacts.map((artifact, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 rounded bg-muted">
                              <Package className="h-4 w-4" />
                              <span>{artifact}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="terminal" className="flex-1 overflow-hidden">
                <div className="h-[60vh] border rounded-md overflow-hidden">
                  <TerminalConsole
                    content={selectedLog.details?.logs.map(log => `${log.time} [${log.level}] ${log.message}`).join('\n') || ''}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LogsHistory;
