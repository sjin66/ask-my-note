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
    <div className="flex max-w-xs flex-col items-center gap-3 text-center">
      <div className="bg-secondary/60 flex h-12 w-12 items-center justify-center rounded-2xl">
        {view === "notes" ? (
          <FileText className="text-muted-foreground/50 h-6 w-6" />
        ) : (
          <MessageSquare className="text-muted-foreground/50 h-6 w-6" />
        )}
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-medium">
          {view === "notes"
            ? "Select a note or create a new one"
            : "Ask a question about your notes"}
        </p>
        <p className="text-muted-foreground/50 mt-1 text-xs">
          {view === "notes"
            ? "Your notes will appear in the sidebar"
            : "AI will search your notes and provide cited answers"}
        </p>
      </div>
    </div>
  );
}

export default App;
