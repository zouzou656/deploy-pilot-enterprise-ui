
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import PageHeader from '@/components/ui-custom/PageHeader';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useThemeStore from '@/stores/themeStore';

const Settings = () => {
  const { toast } = useToast();
  const { theme, setDarkMode, setCompanyName } = useThemeStore();
  const [companyNameInput, setCompanyNameInput] = useState(theme.companyName || 'OSB DevOps');
  const [darkMode, setDarkModeInput] = useState(theme.darkMode);

  const handleSave = () => {
    setCompanyName(companyNameInput);
    setDarkMode(darkMode);
    
    toast({
      title: 'Settings saved',
      description: 'Your settings have been updated successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="System Settings" 
        description="Manage global application settings"
      />
      
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyNameInput}
              onChange={(e) => setCompanyNameInput(e.target.value)}
              placeholder="Company Name"
            />
            <p className="text-sm text-muted-foreground">
              This name will be displayed in the header and other places throughout the application.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="darkMode"
              checked={darkMode}
              onCheckedChange={setDarkModeInput}
            />
            <Label htmlFor="darkMode">Dark Mode</Label>
          </div>
          
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
