import { useState } from "react";
import { KeyRound, Trash2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSettingsStore, type AiProvider } from "@/stores/settingsStore";
import { cn } from "@/lib/utils";

const PROVIDER_OPTIONS: { value: AiProvider; label: string }[] = [
  { value: "bigmodel", label: "BigModel (GLM)" },
  { value: "openai", label: "OpenAI" },
];

export function SettingsModal() {
  const {
    isSettingsOpen,
    closeSettings,
    hasApiKey,
    saving,
    saveApiKey,
    deleteApiKey,
    provider,
    saveProvider,
  } = useSettingsStore();

  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (key.trim().length < 10) {
      setError("API key must be at least 10 characters.");
      return;
    }
    try {
      await saveApiKey(key.trim());
      setKey("");
    } catch (e) {
      setError(String(e));
    }
  };

  const handleDelete = async () => {
    await deleteApiKey();
    setKey("");
    setError("");
  };

  const handleProviderChange = async (newProvider: AiProvider) => {
    try {
      await saveProvider(newProvider);
    } catch (e) {
      console.error("Failed to switch provider:", e);
    }
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your app configuration.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Provider selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">AI Provider</span>
            </div>
            <div className="flex gap-2">
              {PROVIDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleProviderChange(opt.value)}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                    provider === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* API key */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">API Key</span>
              {hasApiKey ? (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-green-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Set
                </span>
              ) : (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-amber-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Not set
                </span>
              )}
            </div>

            <Input
              type="password"
              placeholder="Paste your API key..."
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || !key.trim()}
                className="flex-1"
              >
                {saving ? "Saving..." : "Save Key"}
              </Button>
              {hasApiKey && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
