
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import useAuthStore from "@/stores/authStore";
import { toast } from "sonner";

import PageHeader from "@/components/ui-custom/PageHeader";
import EnhancedTerminal from "@/components/ui-custom/EnhancedTerminal";
import CircularProgress from "@/components/ui-custom/CircularProgress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Download, 
  Package, 
  RefreshCw, 
  Share2, 
  Bell,
  Clock,
  TrendingUp,
  Activity
} from "lucide-react";

import { jarService } from "@/services/jarService";
import { API_CONFIG } from "@/config/api.config";

const TYPICAL_STEPS = [
  "Initializing build environment",
  "Cloning repository", 
  "Analyzing project structure",
  "Compiling source code",
  "Running tests",
  "Packaging artifacts",
  "Generating JAR file",
  "Finalizing deployment"
];

export default function JarStatusPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);

  // Status information
  const [statusInfo, setStatusInfo] = useState<{
    status: string;
    startedAt?: string;
    completedAt?: string;
    jarUrl?: string;
  }>({ status: "QUEUED" });

  // Progress tracking
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>("");
  const [processingSpeed, setProcessingSpeed] = useState<string>("");

  // Logs
  const [logLines, setLogLines] = useState<string[]>([]);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState<boolean>(false);

  // Connection and stats
  const [connection, setConnection] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [logStats, setLogStats] = useState({ total: 0, errors: 0, warnings: 0, logsPerSecond: 0 });
  
  // Timing
  const startTimeRef = useRef<Date | null>(null);
  const logCountRef = useRef<number>(0);

  // Calculate estimated time remaining based on progress rate
  useEffect(() => {
    if (progress > 0 && startTimeRef.current && statusInfo.status === "RUNNING") {
      const elapsed = Date.now() - startTimeRef.current.getTime();
      const rate = progress / elapsed; // progress per millisecond
      const remaining = (100 - progress) / rate;
      
      if (remaining > 0 && remaining < Infinity) {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setEstimatedTimeRemaining(`${minutes}m ${seconds}s`);
      }
    }
  }, [progress, statusInfo.status]);

  // Calculate processing speed
  useEffect(() => {
    const interval = setInterval(() => {
      const currentCount = logLines.length;
      const newLogsThisSecond = currentCount - logCountRef.current;
      logCountRef.current = currentCount;
      
      setLogStats(prev => ({
        ...prev,
        total: currentCount,
        logsPerSecond: newLogsThisSecond
      }));
      
      if (newLogsThisSecond > 0) {
        setProcessingSpeed(`${newLogsThisSecond} logs/sec`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [logLines.length]);

  // Initial status fetch
  useEffect(() => {
    if (!jobId) return;
    (async () => {
      try {
        const data = await jarService.getStatus(jobId);
        setStatusInfo({
          status: data.status,
          startedAt: data.startedAt,
          completedAt: data.completedAt,
          jarUrl: data.jarUrl || undefined,
        });
        
        if (data.status === "RUNNING" && !startTimeRef.current) {
          startTimeRef.current = new Date(data.startedAt || Date.now());
        }
      } catch (err) {
        toast.error(
          `Failed to fetch status: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    })();
  }, [jobId]);

  // SignalR connection setup
  useEffect(() => {
    if (!jobId || !token) return;

    const hubUrl = `${API_CONFIG.BASE_URL}/hubs/joblogs?access_token=${token}`;
    const hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    hubConnection
      .start()
      .then(() => {
        setIsConnected(true);
        return hubConnection.invoke("Subscribe", jobId);
      })
      .catch((err: any) => {
        console.error("SignalR connection error:", err);
        setIsConnected(false);
      });

    hubConnection.onreconnected(() => {
      setIsConnected(true);
      toast.success("Reconnected to live logs");
    });

    hubConnection.onreconnecting(() => {
      setIsConnected(false);
      toast.warning("Reconnecting to live logs...");
    });

    hubConnection.onclose(() => {
      setIsConnected(false);
    });

    // Progress updates
    hubConnection.on(
      "ReceiveProgress",
      (payload: { jobId: string; progress: number; currentStep: string }) => {
        if (payload.jobId === jobId) {
          setProgress(payload.progress);
          setCurrentStep(payload.currentStep);
          
          if (!startTimeRef.current && payload.progress > 0) {
            startTimeRef.current = new Date();
          }
        }
      }
    );

    // Log line updates
    hubConnection.on(
      "ReceiveLogLine",
      (payload: {
        jobId: string;
        timestamp: string;
        level: string;
        message: string;
      }) => {
        if (payload.jobId === jobId) {
          const line = `[${payload.timestamp}][${payload.level}] ${payload.message}`;
          setLogLines((prev) => [...prev, line]);
          
          // Update error/warning counts
          setLogStats(prev => ({
            ...prev,
            errors: payload.level === 'ERROR' ? prev.errors + 1 : prev.errors,
            warnings: payload.level === 'WARN' || payload.level === 'WARNING' ? prev.warnings + 1 : prev.warnings
          }));
        }
      }
    );

    setConnection(hubConnection);

    return () => {
      hubConnection
        .invoke("Unsubscribe", jobId)
        .finally(() => hubConnection.stop())
        .catch(() => hubConnection.stop());
    };
  }, [jobId, token]);

  // Status polling
  useEffect(() => {
    if (!jobId || statusInfo.status === "SUCCESS" || statusInfo.status === "FAILED") {
      if (statusInfo.status === "SUCCESS") {
        setProgress(100);
      }
      return;
    }

    const interval = setInterval(async () => {
      try {
        const data = await jarService.getStatus(jobId);
        setStatusInfo((prev) => ({
          ...prev,
          status: data.status,
          completedAt: data.completedAt,
          jarUrl: data.jarUrl || undefined,
        }));
      } catch {
        // Ignore polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [jobId, statusInfo.status]);

  // Status change notifications
  useEffect(() => {
    if (statusInfo.status === "SUCCESS") {
      toast.success("JAR generation completed! Download is available.");
      // Browser notification if supported
      if (Notification.permission === "granted") {
        new Notification("JAR Generation Complete", {
          body: "Your JAR file is ready for download!",
          icon: "/favicon.ico"
        });
      }
    } else if (statusInfo.status === "FAILED") {
      toast.error("JAR generation failed. Check logs for details.");
      if (Notification.permission === "granted") {
        new Notification("JAR Generation Failed", {
          body: "Please check the logs for error details.",
          icon: "/favicon.ico"
        });
      }
    }
  }, [statusInfo.status]);

  const refreshStatus = async () => {
    if (!jobId) return;
    try {
      const data = await jarService.getStatus(jobId);
      setStatusInfo({
        status: data.status,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        jarUrl: data.jarUrl || undefined,
      });
      toast.success("Status refreshed");
    } catch (err) {
      toast.error("Failed to refresh status");
    }
  };

  const shareStatus = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Status page URL copied to clipboard");
  };

  const requestNotificationPermission = () => {
    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          toast.success("Notifications enabled");
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="JAR Generation Status"
        description={`Job ID: ${jobId}`}
      />

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-semibold">{statusInfo.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="font-semibold">{Math.round(progress)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">ETA</p>
                <p className="font-semibold">{estimatedTimeRemaining || "Calculating..."}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="text-xs text-muted-foreground">Connection</p>
                <p className="font-semibold">{isConnected ? "Live" : "Disconnected"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Build Progress</CardTitle>
            <CardDescription>
              {statusInfo.status === "RUNNING" && processingSpeed && (
                <span className="text-blue-600">Processing: {processingSpeed}</span>
              )}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshStatus}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={shareStatus}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            {Notification.permission === "default" && (
              <Button variant="outline" size="sm" onClick={requestNotificationPermission}>
                <Bell className="h-4 w-4 mr-1" />
                Notify
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <CircularProgress
            progress={progress}
            status={statusInfo.status}
            currentStep={currentStep}
            steps={TYPICAL_STEPS}
            size={140}
          />
        </CardContent>
      </Card>

      {/* Enhanced Terminal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Live Build Logs
            {isConnected && (
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Connected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Real-time streaming from the build server • {logStats.total} total logs • {logStats.errors} errors • {logStats.warnings} warnings
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <EnhancedTerminal
            logs={logLines}
            isExpanded={isTerminalExpanded}
            onToggleExpand={() => setIsTerminalExpanded(!isTerminalExpanded)}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between space-x-4">
        <Button variant="outline" onClick={() => navigate("/jar-generation")}>
          Back to Wizard
        </Button>

        {statusInfo.status === "SUCCESS" && statusInfo.jarUrl && (
          <div className="flex gap-2">
            <Button onClick={() => window.open(statusInfo.jarUrl!, "_blank")}>
              <Download className="h-4 w-4 mr-1" />
              Download JAR
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                navigate(`/jar-viewer/${encodeURIComponent(statusInfo.jarUrl!)}`)
              }
            >
              <Package className="h-4 w-4 mr-1" />
              View Contents
            </Button>
          </div>
        )}
      </div>

      {/* Full-Screen Terminal Dialog */}
      <Dialog open={isTerminalExpanded} onOpenChange={setIsTerminalExpanded}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Full-Screen Terminal</DialogTitle>
          </DialogHeader>
          
          <EnhancedTerminal
            logs={logLines}
            isExpanded={true}
            onToggleExpand={() => setIsTerminalExpanded(false)}
            className="h-full rounded-none border-0"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
