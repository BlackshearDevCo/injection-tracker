import { useState } from "react";
import type { InjectionSite } from "../types";
import { useInjections } from "../hooks/useInjections";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

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

// Site colors: left = orange, right = sky
const siteColors = {
  left: { fill: "rgba(251, 146, 60, 0.15)", stroke: "rgba(251, 146, 60, 0.5)", dot: "rgba(251, 146, 60, 0.8)" },
  right: { fill: "rgba(56, 189, 248, 0.15)", stroke: "rgba(56, 189, 248, 0.5)", dot: "rgba(56, 189, 248, 0.8)" },
} as const;

function ThighDiagram({ suggested }: { suggested: InjectionSite | null }) {
  const leftIsSuggested = suggested === "left";
  const rightIsSuggested = suggested === "right";
  const leftColors = siteColors.left;
  const rightColors = siteColors.right;

  return (
    <svg width="160" height="180" viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left thigh */}
      <path
        d="M30 10 C30 10, 20 60, 22 100 C24 140, 30 170, 35 175 L55 175 C58 170, 68 140, 70 100 C72 60, 72 10, 72 10 Z"
        fill={leftIsSuggested ? leftColors.fill : "rgba(148, 163, 184, 0.05)"}
        stroke={leftIsSuggested ? leftColors.stroke : "rgba(148, 163, 184, 0.15)"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {leftIsSuggested && (
        <circle cx="50" cy="85" r="5" fill={leftColors.dot} className="transition-all duration-500">
          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <text x="50" y="25" textAnchor="middle" fill="rgba(148, 163, 184, 0.5)" fontSize="10" fontWeight="500">L</text>

      {/* Right thigh */}
      <path
        d="M88 10 C88 10, 88 60, 90 100 C92 140, 102 170, 105 175 L125 175 C128 170, 136 140, 138 100 C140 60, 130 10, 130 10 Z"
        fill={rightIsSuggested ? rightColors.fill : "rgba(148, 163, 184, 0.05)"}
        stroke={rightIsSuggested ? rightColors.stroke : "rgba(148, 163, 184, 0.15)"}
        strokeWidth="1.5"
        className="transition-all duration-500"
      />
      {rightIsSuggested && (
        <circle cx="110" cy="85" r="5" fill={rightColors.dot} className="transition-all duration-500">
          <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
      <text x="110" y="25" textAnchor="middle" fill="rgba(148, 163, 184, 0.5)" fontSize="10" fontWeight="500">R</text>
    </svg>
  );
}

export default function Dashboard() {
  const { latest, checkDuplicate, add } = useInjections();
  const [flash, setFlash] = useState<{ message: string; type: "success" } | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{ site: InjectionSite; existingSite: string } | null>(null);

  function handleLog(site: InjectionSite) {
    const existing = checkDuplicate();
    if (existing) {
      setPendingConfirm({ site, existingSite: existing.site });
      return;
    }
    commitLog(site);
  }

  function commitLog(site: InjectionSite) {
    add(site);
    setPendingConfirm(null);
    setFlash({ message: `Logged ${siteLabel(site)}`, type: "success" });
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
      <ThighDiagram suggested={suggested} />

      {/* Log buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-medium text-center">
          Log injection
        </p>
        <div className="flex gap-3">
          {(["left", "right"] as const).map((site) => {
            const isSuggested = suggested === site;
            const dotColor = site === "left" ? "bg-orange-400" : "bg-sky-400";
            return (
              <button
                key={site}
                onClick={() => handleLog(site)}
                className={`flex-1 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                  isSuggested
                    ? site === "left"
                      ? "bg-orange-500/90 text-white shadow-lg shadow-orange-500/20 pulse-glow"
                      : "bg-sky-500/90 text-white shadow-lg shadow-sky-500/20 pulse-glow"
                    : "bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:bg-white/[0.06]"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSuggested ? "bg-white/60" : dotColor}`} />
                  {site === "left" ? "Left" : "Right"}
                </span>
                {isSuggested && (
                  <span className="block text-[10px] font-medium mt-0.5 opacity-75">
                    Suggested
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duplicate confirmation */}
      {pendingConfirm && (
        <div className="flash-enter fixed bottom-24 left-4 right-4 max-w-sm mx-auto py-3 px-4 rounded-2xl text-sm backdrop-blur-sm bg-amber-500/10 text-amber-300 border border-amber-500/20">
          <p className="text-center font-medium">
            Already logged {pendingConfirm.existingSite} thigh today
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => commitLog(pendingConfirm.site)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-500/30 active:scale-[0.97] transition-all"
            >
              Log anyway
            </button>
            <button
              onClick={() => setPendingConfirm(null)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] text-slate-400 border border-white/[0.08] active:scale-[0.97] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Flash message */}
      {flash && !pendingConfirm && (
        <div className="flash-enter fixed bottom-24 left-4 right-4 max-w-sm mx-auto text-center py-3 px-4 rounded-2xl text-sm font-medium backdrop-blur-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          {flash.message}
        </div>
      )}
    </div>
  );
}
