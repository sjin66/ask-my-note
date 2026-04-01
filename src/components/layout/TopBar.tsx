import { useAppStore } from "../../stores/appStore";

export function TopBar() {
  const { activeView, setActiveView } = useAppStore();

  return (
    <header className="flex items-center justify-between px-4 h-11 border-b border-gray-200 bg-white shrink-0">
      <div className="flex gap-1">
        <button
          onClick={() => setActiveView("notes")}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            activeView === "notes"
              ? "bg-gray-100 text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Notes
        </button>
        <button
          onClick={() => setActiveView("chat")}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            activeView === "chat"
              ? "bg-gray-100 text-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Chat
        </button>
      </div>
      <button className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none">
        ⚙
      </button>
    </header>
  );
}
