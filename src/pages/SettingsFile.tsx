
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Save, FileJson, Copy, Download } from 'lucide-react';
import CodeEditor from '@/components/ui-custom/CodeEditor';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const SettingsFile = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<string>(`{
  "project": {
    "name": "OSB Integration",
    "version": "1.0.0"
  },
  "environment": {
    "development": {
      "weblogic": {
        "host": "dev-weblogic.example.com",
        "port": 7001,
        "username": "weblogic"
      }
    },
    "testing": {
      "weblogic": {
        "host": "test-weblogic.example.com",
        "port": 7001,
        "username": "weblogic"
      }
    },
    "production": {
      "weblogic": {
        "host": "prod-weblogic.example.com",
        "port": 7001,
        "username": "weblogic"
      }
    }
  }
}`);

  const [template, setTemplate] = useState<string>('default');

  const templates = {
    default: `{
  "project": {
    "name": "OSB Integration",
    "version": "1.0.0"
  },
  "environment": {
    "development": {
      "weblogic": {
        "host": "dev-weblogic.example.com",
        "port": 7001,
        "username": "weblogic"
      }
    },
    "testing": {
      "weblogic": {
        "host": "test-weblogic.example.com",
        "port": 7001,
        "username": "weblogic"
      }
    },
    "production": {
      "weblogic": {
        "host": "prod-weblogic.example.com",
        "port": 7001,
        "username": "weblogic"
      }
    }
  }
}`,
    minimal: `{
  "project": {
    "name": "OSB Integration",
    "version": "1.0.0"
  },
  "environment": {
    "development": {
      "weblogic": {
        "host": "dev-weblogic.example.com",
        "port": 7001
      }
    }
  }
}`,
    extended: `{
  "project": {
    "name": "OSB Integration",
    "version": "1.0.0",
    "description": "Main OSB integration project",
    "owner": "Integration Team",
    "repository": "git@github.com:example/osb-integration.git"
  },
  "environment": {
    "development": {
      "weblogic": {
        "host": "dev-weblogic.example.com",
        "port": 7001,
        "username": "weblogic",
        "domainName": "dev_domain",
        "clusterName": "dev_cluster",
        "jmsServer": "dev_jms",
        "dataSourceName": "dev_ds"
      },
      "monitoring": {
        "enabled": true,
        "alertThreshold": "warning",
        "notificationEmail": "dev-alerts@example.com"
      },
      "logging": {
        "level": "DEBUG",
        "retention": "7d"
      }
    },
    "testing": {
      "weblogic": {
        "host": "test-weblogic.example.com",
        "port": 7001,
        "username": "weblogic",
        "domainName": "test_domain",
        "clusterName": "test_cluster",
        "jmsServer": "test_jms",
        "dataSourceName": "test_ds"
      },
      "monitoring": {
        "enabled": true,
        "alertThreshold": "warning",
        "notificationEmail": "test-alerts@example.com"
      },
      "logging": {
        "level": "INFO",
        "retention": "14d"
      }
    },
    "production": {
      "weblogic": {
        "host": "prod-weblogic.example.com",
        "port": 7001,
        "username": "weblogic",
        "domainName": "prod_domain",
        "clusterName": "prod_cluster",
        "jmsServer": "prod_jms",
        "dataSourceName": "prod_ds"
      },
      "monitoring": {
        "enabled": true,
        "alertThreshold": "error",
        "notificationEmail": "prod-alerts@example.com",
        "smsNotifications": true,
        "oncallRotation": "integration-team"
      },
      "logging": {
        "level": "WARN",
        "retention": "30d",
        "archiving": true,
        "archiveLocation": "s3://logs-backup/osb"
      },
      "performance": {
        "cachingEnabled": true,
        "maxThreads": 50,
        "connectionPoolSize": 20,
        "timeoutSeconds": 30
      }
    }
  },
  "deployment": {
    "strategy": "rolling",
    "backupBefore": true,
    "approvalRequired": {
      "testing": false,
      "production": true
    },
    "notifications": {
      "slack": "#deployments",
      "email": "team@example.com"
    }
  }
}`
  };

  const handleTemplateChange = (template: string) => {
    setTemplate(template);
    setSettings(templates[template as keyof typeof templates]);
  };

  const handleSave = () => {
    // Validate JSON
    try {
      JSON.parse(settings);
      toast({
        title: "Settings Saved",
        description: "Your configuration has been saved successfully.",
      });
    } catch (e) {
      toast({
        title: "Invalid JSON",
        description: "Please fix the JSON format before saving.",
        variant: "destructive"
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(settings);
    toast({
      title: "Copied to Clipboard",
      description: "Configuration has been copied to clipboard.",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([settings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'osb-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings File" 
        description="Configure deployment settings for OSB integration projects"
      />
      
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Configuration Editor
            </CardTitle>
            <CardDescription>
              Edit JSON configuration for deployment environments
            </CardDescription>
          </div>
          <div className="mt-4 md:mt-0">
            {/* Wrap TabsList in a Tabs component */}
            <Tabs value={template} onValueChange={handleTemplateChange}>
              <TabsList>
                <TabsTrigger value="default">
                  Standard
                </TabsTrigger>
                <TabsTrigger value="minimal">
                  Minimal
                </TabsTrigger>
                <TabsTrigger value="extended">
                  Extended
                </TabsTrigger>
              </TabsList>
              
              {/* Add TabsContent components for each tab, even though we don't directly display them */}
              <TabsContent value="default" className="hidden"></TabsContent>
              <TabsContent value="minimal" className="hidden"></TabsContent>
              <TabsContent value="extended" className="hidden"></TabsContent>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg overflow-hidden border">
            <div className="h-[500px]">
              <CodeEditor
                value={settings}
                onChange={setSettings}
                language="json"
              />
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsFile;
