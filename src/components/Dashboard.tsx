import { useState } from "react";
import type { InjectionSite } from "../types";
import { useInjections } from "../hooks/useInjections";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function siteLabel(site: InjectionSite): string {
  return site === "left" ? "Left Thigh" : "Right Thigh";
}

export default function Dashboard() {
  const { latest, add } = useInjections();
  const [flash, setFlash] = useState<{ message: string; type: "success" | "warning" } | null>(
    null
  );

  function handleLog(site: InjectionSite) {
    const { warning } = add(site);
    if (warning) {
      setFlash({ message: warning, type: "warning" });
    } else {
      setFlash({ message: `Logged ${siteLabel(site)} for today.`, type: "success" });
    }
    setTimeout(() => setFlash(null), 4000);
  }

  const suggested: InjectionSite | null = latest
    ? latest.site === "left"
      ? "right"
      : "left"
    : null;

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-4 py-8 h-full">
      {/* Last injection */}
      <div className="text-center">
        {latest ? (
          <>
            <p className="text-sm text-slate-400 uppercase tracking-wide">Last injection</p>
            <p className="text-2xl font-semibold mt-1">{siteLabel(latest.site)}</p>
            <p className="text-slate-400 mt-1">{formatDate(latest.date)}</p>
          </>
        ) : (
          <p className="text-slate-400">No injections logged yet</p>
        )}
      </div>

      {/* Log buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <p className="text-sm text-slate-400 uppercase tracking-wide text-center">
          Log today&apos;s injection
        </p>
        {(["left", "right"] as const).map((site) => (
          <button
            key={site}
            onClick={() => handleLog(site)}
            className={`w-full py-4 rounded-2xl text-lg font-semibold transition-all active:scale-95 ${
              suggested === site
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                : "bg-slate-800 text-slate-300 border border-slate-700"
            }`}
          >
            {siteLabel(site)}
            {suggested === site && (
              <span className="block text-xs font-normal mt-0.5 opacity-75">Suggested</span>
            )}
          </button>
        ))}
      </div>

      {/* Flash message */}
      {flash && (
        <div
          className={`fixed bottom-24 left-4 right-4 text-center py-3 px-4 rounded-xl text-sm font-medium ${
            flash.type === "warning"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          }`}
        >
          {flash.message}
        </div>
      )}
    </div>
  );
}
