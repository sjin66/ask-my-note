import { useState } from "react";
import { Sparkles } from "lucide-react";
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

export function OnboardingModal() {
  const { hasApiKey, saving, saveApiKey } = useSettingsStore();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  // Show only when we've confirmed no key exists
  if (hasApiKey !== false) return null;

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

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <DialogTitle>Welcome to ask-my-note</DialogTitle>
          </div>
          <DialogDescription className="pt-1">
            To get started, enter your OpenAI API key. This powers the AI chat and
            note search features. Your key is stored locally on your machine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Input
            type="password"
            placeholder="sk-..."
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <Button
            onClick={handleSave}
            disabled={saving || !key.trim()}
            className="w-full"
          >
            {saving ? "Saving..." : "Get Started"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Get a key from{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-2"
            >
              platform.openai.com
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
