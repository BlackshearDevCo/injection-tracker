import { useRef, useState } from "react";
import Dashboard from "./components/Dashboard";
import History from "./components/History";

type View = "log" | "history";

function LogIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState<View>("log");
  const [animating, setAnimating] = useState(false);
  const [displayedView, setDisplayedView] = useState<View>("log");
  const [slideClass, setSlideClass] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleNav(next: View) {
    if (next === view || animating) return;

    const direction = next === "history" ? "left" : "right";

    // Slide current view out
    setSlideClass(`slide-out-${direction}`);
    setAnimating(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      // Swap content and slide new view in
      setDisplayedView(next);
      setSlideClass(`slide-in-${direction}`);

      timeoutRef.current = setTimeout(() => {
        setSlideClass("");
        setAnimating(false);
        setView(next);
      }, 120);
    }, 120);
  }

  const tabs = [
    { id: "log" as const, label: "Log", Icon: LogIcon },
    { id: "history" as const, label: "History", Icon: HistoryIcon },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto">
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className={`flex-1 min-h-0 flex flex-col ${slideClass}`}>
          {displayedView === "log" ? <Dashboard /> : <History />}
        </div>
      </main>

      <nav className="flex border-t border-white/5 bg-[#0c0f1a]/95 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0c0f1a]/80 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleNav(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 pt-2.5 pb-2 transition-colors ${
                isActive ? "text-indigo-400" : "text-slate-500"
              }`}
            >
              <tab.Icon active={isActive} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
