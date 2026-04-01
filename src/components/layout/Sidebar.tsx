export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">
      <div className="p-3 border-b border-gray-200">
        <button className="w-full text-left px-3 py-2 rounded text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          + New Note
        </button>
      </div>
      <div className="p-3 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search notes..."
          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded outline-none focus:border-gray-400 transition-colors"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <p className="text-xs text-gray-400 text-center mt-8 px-4">
          No notes yet. Create your first note to get started.
        </p>
      </div>
    </aside>
  );
}
