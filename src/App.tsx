import { useState } from "react";
import Dashboard from "./components/Dashboard";
import History from "./components/History";

type View = "log" | "history";

export default function App() {
  const [view, setView] = useState<View>("log");

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {view === "log" ? <Dashboard /> : <History />}
      </main>

      {/* Bottom nav */}
      <nav className="flex border-t border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80 pb-[env(safe-area-inset-bottom)]">
        {([
          { id: "log" as const, label: "Log" },
          { id: "history" as const, label: "History" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              view === tab.id
                ? "text-sky-400"
                : "text-slate-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
