import "./App.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { useAppStore } from "@/stores/appStore";
import { useNoteStore } from "@/stores/noteStore";
import { MessageSquare, FileText } from "lucide-react";

function App() {
  const activeView = useAppStore((s) => s.activeView);
  const activeNoteId = useNoteStore((s) => s.activeNoteId);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground select-none">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex overflow-hidden">
          {activeView === "notes" && activeNoteId ? (
            <NoteEditor />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState view={activeView} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyState({ view }: { view: "notes" | "chat" }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center max-w-xs">
      <div className="h-12 w-12 rounded-2xl bg-secondary/60 flex items-center justify-center">
        {view === "notes" ? (
          <FileText className="h-6 w-6 text-muted-foreground/50" />
        ) : (
          <MessageSquare className="h-6 w-6 text-muted-foreground/50" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          {view === "notes"
            ? "Select a note or create a new one"
            : "Ask a question about your notes"}
        </p>
        <p className="text-xs text-muted-foreground/50 mt-1">
          {view === "notes"
            ? "Your notes will appear in the sidebar"
            : "AI will search your notes and provide cited answers"}
        </p>
      </div>
    </div>
  );
}

export default App;
