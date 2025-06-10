// src/pages/SettingsFile.tsx

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui-custom/PageHeader";
import { Save, FileJson, Copy, Download } from "lucide-react";
import CodeEditor from "@/components/ui-custom/CodeEditor";
import { useToast } from "@/hooks/use-toast";

import { settingsService } from "@/services/settingsFileService";

const SettingsFile: React.FC = () => {
  const { toast } = useToast();

  // The JSON text shown in the editor:
  const [settings, setSettings] = useState<string>("");

  // Is the current `settings` valid JSON?
  const [isValidJson, setIsValidJson] = useState<boolean>(true);
  // If invalid, hold the parse error message:
  const [parseError, setParseError] = useState<string>("");

  // Loading / saving indicators:
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // 1) On mount, fetch the JSON from the backend:
  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await settingsService.getSettings();
        if (!cancelled) {
          // Pretty-print with 2-space indent
          const pretty = JSON.stringify(data, null, 2);
          setSettings(pretty);

          // Validate immediately:
          setIsValidJson(true);
          setParseError("");
        }
      } catch (err: any) {
        if (!cancelled) {
          // If fetch fails, show a toast and set an empty object as fallback
          setSettings("{}");
          setIsValidJson(true);
          setParseError("");
          toast({
            title: "Failed to load configuration",
            description: err.message || "Could not fetch config from server.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  // 2) Re-validate JSON whenever `settings` changes:
  useEffect(() => {
    // If the editor is empty, we consider it invalid:
    if (settings.trim() === "") {
      setIsValidJson(false);
      setParseError("Configuration cannot be empty.");
      return;
    }

    try {
      JSON.parse(settings);
      setIsValidJson(true);
      setParseError("");
    } catch (e: any) {
      setIsValidJson(false);
      setParseError(e.message);
    }
  }, [settings]);

  // 3) On “Save,” only attempt PUT if valid JSON
  const handleSave = async () => {
    if (!isValidJson) {
      toast({
        title: "Invalid JSON",
        description: "Please fix the JSON syntax before saving.",
        variant: "destructive",
      });
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(settings);
    } catch {
      // This should never happen because we already validated
      toast({
        title: "Invalid JSON",
        description: "Please fix the JSON syntax before saving.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await settingsService.updateSettings(parsed);
      toast({
        title: "Settings Saved",
        description: "Configuration has been updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to update configuration",
        description: err.message || "Could not send updated config to server.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // 4) Copy to clipboard (unchanged)
  const handleCopy = () => {
    navigator.clipboard.writeText(settings);
    toast({
      title: "Copied to Clipboard",
      description: "Configuration has been copied to clipboard.",
    });
  };

  // 5) Download as .json (unchanged)
  const handleDownload = () => {
    const blob = new Blob([settings], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings File"
        description="Fetch and edit your configuration JSON"
      />

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Configuration Editor
            </CardTitle>
            <CardDescription>
              Load the JSON from the backend, edit it, then save it back.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <div className="bg-muted rounded-lg overflow-hidden border">
            <div className="h-[500px]">
              <CodeEditor
                value={settings}
                onChange={setSettings}
                language="json"
                readOnly={loading}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={handleSave}
              disabled={!isValidJson || saving}
              variant="primary"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>

            <Button variant="outline" onClick={handleCopy} disabled={loading}>
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>

            <Button variant="outline" onClick={handleDownload} disabled={loading}>
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
