
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Save } from 'lucide-react';
import CodeEditor from '@/components/ui-custom/CodeEditor';

const SettingsFile = () => {
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

  const handleSave = () => {
    console.log("Settings saved:", settings);
    // Implementation would save the settings to the backend
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings File" 
        description="Edit your deployment configuration settings"
      />
      
      <Card>
        <CardContent className="pt-6">
          <div className="h-[500px] rounded-md border overflow-hidden">
            <CodeEditor
              value={settings}
              onChange={setSettings}
              language="json"
            />
          </div>
          
          <div className="mt-4">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsFile;
