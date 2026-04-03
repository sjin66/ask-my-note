import { useEffect } from "react";
import "./App.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { ChatView } from "@/components/chat/ChatView";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { OnboardingModal } from "@/components/settings/OnboardingModal";
import { useAppStore } from "@/stores/appStore";
import { useNoteStore } from "@/stores/noteStore";
import { useChatStore } from "@/stores/chatStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { MessageSquare, FileText } from "lucide-react";

function App() {
  const activeView = useAppStore((s) => s.activeView);
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const checkApiKey = useSettingsStore((s) => s.checkApiKey);
  const loadProvider = useSettingsStore((s) => s.loadProvider);

  useEffect(() => {
    checkApiKey();
    loadProvider();
  }, [checkApiKey, loadProvider]);

  return (
    <div className="bg-background text-foreground flex h-screen flex-col select-none">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 overflow-hidden">
          {activeView === "notes" && activeNoteId ? (
            <NoteEditor />
          ) : activeView === "chat" && activeConversationId ? (
            <ChatView />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState view={activeView} />
            </div>
          )}
        </main>
      </div>

      <SettingsModal />
      <OnboardingModal />
    </div>
  );
}

function EmptyState({ view }: { view: "notes" | "chat" }) {
  return (
    <div className="border-border bg-card flex max-w-xs flex-col items-center gap-4 rounded-2xl border p-8 text-center shadow-sm">
      <div className="border-border bg-secondary flex size-14 items-center justify-center rounded-xl border">
        {view === "notes" ? (
          <FileText className="text-muted-foreground size-7" />
        ) : (
          <MessageSquare className="text-muted-foreground size-7" />
        )}
      </div>
      <div>
        <p className="text-foreground mb-1.5 text-sm font-semibold">
          {view === "notes"
            ? "Select a note or create a new one"
            : "Ask a question about your notes"}
        </p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          {view === "notes"
            ? "Your notes will appear in the sidebar"
            : "AI will search your notes and provide cited answers"}
        </p>
      </div>
    </div>
  );
}

export default App;
