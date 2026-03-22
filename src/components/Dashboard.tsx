import { useState } from "react";
import type { InjectionSite } from "../types";
import { useInjections } from "../hooks/useInjections";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function siteLabel(site: InjectionSite): string {
  return site === "left" ? "Left Thigh" : "Right Thigh";
}

function ThighDiagram({ lastSite, suggested }: { lastSite: InjectionSite | null; suggested: InjectionSite | null }) {
  const leftIsLast = lastSite === "left";
  const rightIsLast = lastSite === "right";
  const leftIsSuggested = suggested === "left";
  const rightIsSuggested = suggested === "right";

  return (
    <svg width="160" height="180" viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left thigh */}
      <path
        d="M30 10 C30 10, 20 60, 22 100 C24 140, 30 170, 35 175 L55 175 C58 170, 68 140, 70 100 C72 60, 72 10, 72 10 Z"
        fill={leftIsLast ? "rgba(139, 92, 246, 0.15)" : leftIsSuggested ? "rgba(99, 102, 241, 0.08)" : "rgba(148, 163, 184, 0.05)"}
        stroke={leftIsLast ? "rgba(139, 92, 246, 0.5)" : leftIsSuggested ? "rgba(99, 102, 241, 0.3)" : "rgba(148, 163, 184, 0.15)"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {leftIsLast && (
        <circle cx="50" cy="85" r="5" fill="rgba(139, 92, 246, 0.8)" className="transition-all duration-500">
          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      {leftIsSuggested && (
        <circle cx="50" cy="85" r="4" fill="none" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="1.5" strokeDasharray="3 3" className="transition-all duration-500">
          <animate attributeName="stroke-dashoffset" values="0;6" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      <text x="50" y="25" textAnchor="middle" fill="rgba(148, 163, 184, 0.5)" fontSize="10" fontWeight="500">L</text>

      {/* Right thigh */}
      <path
        d="M88 10 C88 10, 88 60, 90 100 C92 140, 102 170, 105 175 L125 175 C128 170, 136 140, 138 100 C140 60, 130 10, 130 10 Z"
        fill={rightIsLast ? "rgba(139, 92, 246, 0.15)" : rightIsSuggested ? "rgba(99, 102, 241, 0.08)" : "rgba(148, 163, 184, 0.05)"}
        stroke={rightIsLast ? "rgba(139, 92, 246, 0.5)" : rightIsSuggested ? "rgba(99, 102, 241, 0.3)" : "rgba(148, 163, 184, 0.15)"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {rightIsLast && (
        <circle cx="110" cy="85" r="5" fill="rgba(139, 92, 246, 0.8)" className="transition-all duration-500">
          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      {rightIsSuggested && (
        <circle cx="110" cy="85" r="4" fill="none" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="1.5" strokeDasharray="3 3" className="transition-all duration-500">
          <animate attributeName="stroke-dashoffset" values="0;6" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      <text x="110" y="25" textAnchor="middle" fill="rgba(148, 163, 184, 0.5)" fontSize="10" fontWeight="500">R</text>
    </svg>
  );
}

export default function Dashboard() {
  const { latest, add } = useInjections();
  const [flash, setFlash] = useState<{ message: string; type: "success" | "warning" } | null>(null);

  function handleLog(site: InjectionSite) {
    const { warning } = add(site);
    if (warning) {
      setFlash({ message: warning, type: "warning" });
    } else {
      setFlash({ message: `Logged ${siteLabel(site)}`, type: "success" });
    }
    setTimeout(() => setFlash(null), 3000);
  }

  const suggested: InjectionSite | null = latest
    ? latest.site === "left" ? "right" : "left"
    : null;

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-8 h-full">
      {/* Last injection card */}
      <div className="w-full max-w-xs">
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 text-center">
          {latest ? (
            <>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">Last injection</p>
              <p className="text-xl font-semibold text-slate-100 mt-2">{siteLabel(latest.site)}</p>
              <p className="text-sm text-slate-400 mt-1">{formatDate(latest.date)}</p>
            </>
          ) : (
            <>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">Last injection</p>
              <p className="text-sm text-slate-400 mt-3">Nothing logged yet</p>
            </>
          )}
        </div>
      </div>

      {/* Thigh diagram */}
      <ThighDiagram lastSite={latest?.site ?? null} suggested={suggested} />

      {/* Log buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-medium text-center">
          Log injection
        </p>
        <div className="flex gap-3">
          {(["left", "right"] as const).map((site) => {
            const isSuggested = suggested === site;
            return (
              <button
                key={site}
                onClick={() => handleLog(site)}
                className={`flex-1 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                  isSuggested
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 pulse-glow"
                    : "bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:bg-white/[0.06]"
                }`}
              >
                {site === "left" ? "Left" : "Right"}
                {isSuggested && (
                  <span className="block text-[10px] font-medium mt-0.5 text-indigo-200">
                    Suggested
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Flash message */}
      {flash && (
        <div
          className={`flash-enter fixed bottom-24 left-4 right-4 max-w-sm mx-auto text-center py-3 px-4 rounded-2xl text-sm font-medium backdrop-blur-sm ${
            flash.type === "warning"
              ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
              : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
          }`}
        >
          {flash.message}
        </div>
      )}
    </div>
  );
}
