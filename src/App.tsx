import "./App.css";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { useAppStore } from "./stores/appStore";

function App() {
  const activeView = useAppStore((s) => s.activeView);

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 select-none">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          {activeView === "notes" ? (
            <p>Select a note or create a new one</p>
          ) : (
            <p>Ask a question about your notes</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
