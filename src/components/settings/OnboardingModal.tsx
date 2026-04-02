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
import { useSettingsStore, type AiProvider } from "@/stores/settingsStore";
import { cn } from "@/lib/utils";

const PROVIDER_OPTIONS: { value: AiProvider; label: string; hint: string; keyUrl: string }[] = [
  {
    value: "bigmodel",
    label: "BigModel (GLM)",
    hint: "Get a key from open.bigmodel.cn",
    keyUrl: "https://open.bigmodel.cn/usercenter/apikeys",
  },
  {
    value: "openai",
    label: "OpenAI",
    hint: "Get a key from platform.openai.com",
    keyUrl: "https://platform.openai.com/api-keys",
  },
];

export function OnboardingModal() {
  const { hasApiKey, saving, saveApiKey, saveProvider } = useSettingsStore();
  const [provider, setProvider] = useState<AiProvider>("bigmodel");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  if (hasApiKey !== false) return null;

  const selected = PROVIDER_OPTIONS.find((p) => p.value === provider)!;

  const handleSave = async () => {
    setError("");
    if (key.trim().length < 10) {
      setError("API key must be at least 10 characters.");
      return;
    }
    try {
      await saveProvider(provider);
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
            Choose your AI provider and enter your API key. This powers the chat
            and note search features. Your key is stored locally on your machine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div className="flex gap-2">
            {PROVIDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setProvider(opt.value);
                  setError("");
                }}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  provider === opt.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                )}
              >
                {opt.label}
              </button>
            ))}
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
            {selected.hint} —{" "}
            <a
              href={selected.keyUrl}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-2"
            >
              get API key
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
