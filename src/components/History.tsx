import { useRef, useState } from "react";
import type { Injection, InjectionSite } from "../types";
import { useInjections } from "../hooks/useInjections";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function siteLabel(site: InjectionSite): string {
  return site === "left" ? "Left Thigh" : "Right Thigh";
}

function SiteDot({ site }: { site: InjectionSite }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${
        site === "left" ? "bg-orange-400" : "bg-sky-400"
      }`}
    />
  );
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function EditRow({
  injection,
  onSave,
  onCancel,
}: {
  injection: Injection;
  onSave: (updates: Partial<Omit<Injection, "id">>) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(injection.date);
  const [site, setSite] = useState<InjectionSite>(injection.site);

  return (
    <div className="rounded-2xl bg-white/[0.05] border border-white/[0.08] p-4 space-y-3">
      <div>
        <label className="text-[11px] text-slate-500 uppercase tracking-widest font-medium block mb-1.5">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/[0.08] text-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-colors"
        />
      </div>
      <div>
        <label className="text-[11px] text-slate-500 uppercase tracking-widest font-medium block mb-1.5">
          Site
        </label>
        <div className="flex gap-2">
          {(["left", "right"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSite(s)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                site === s
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white/[0.04] text-slate-400 border border-white/[0.08]"
              }`}
            >
              {siteLabel(s)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onSave({ date, site })}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-emerald-500/90 text-white transition-colors hover:bg-emerald-500"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/[0.04] text-slate-400 border border-white/[0.08] transition-colors hover:bg-white/[0.06]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function History() {
  const { injections, update, remove, exportData, importData } = useInjections();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `injection-tracker-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const { error } = importData(reader.result as string);
      if (error) setImportError(error);
      else setImportError(null);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSave(id: string, updates: Partial<Omit<Injection, "id">>) {
    update(id, updates);
    setEditingId(null);
  }

  function handleDelete(id: string) {
    remove(id);
    setEditingId(null);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-6 pb-3">
        <h2 className="text-lg font-semibold text-slate-100">History</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {injections.length} injection{injections.length !== 1 ? "s" : ""} logged
        </p>
      </div>

      {/* Data actions */}
      <div className="flex gap-2 px-5 pb-4">
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium bg-white/[0.04] text-slate-400 border border-white/[0.08] transition-colors hover:bg-white/[0.06]"
        >
          <DownloadIcon />
          Export
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium bg-white/[0.04] text-slate-400 border border-white/[0.08] transition-colors hover:bg-white/[0.06]"
        >
          <UploadIcon />
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {importError && (
        <p className="text-xs text-red-400 px-5 pb-3">{importError}</p>
      )}

      {/* Injection list */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {injections.length === 0 ? (
          <div className="text-center mt-16">
            <p className="text-slate-600 text-sm">No injections logged yet</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {injections.map((injection) =>
              editingId === injection.id ? (
                <li key={injection.id}>
                  <EditRow
                    injection={injection}
                    onSave={(updates) => handleSave(injection.id, updates)}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <li
                  key={injection.id}
                  className="flex items-center justify-between rounded-2xl bg-white/[0.03] border border-white/[0.05] px-4 py-3.5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <SiteDot site={injection.site} />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {siteLabel(injection.site)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(injection.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingId(injection.id)}
                      className="text-xs text-slate-500 hover:text-indigo-400 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(injection.id)}
                      className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
