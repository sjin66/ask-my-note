import { useState } from "react";
import { KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/stores/settingsStore";

export function SettingsModal() {
  const { isSettingsOpen, closeSettings, hasApiKey, saving, saveApiKey, deleteApiKey } =
    useSettingsStore();

  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (!key.trim().startsWith("sk-") || key.trim().length < 20) {
      setError("Key must start with 'sk-' and be at least 20 characters.");
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

  return (
    <Dialog open={isSettingsOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your app configuration.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">OpenAI API Key</span>
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
              placeholder="sk-..."
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
