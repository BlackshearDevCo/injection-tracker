import { useRef, useState } from "react";
import type { Injection, InjectionSite } from "../types";
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
    <div className="bg-slate-800 rounded-xl p-4 space-y-3">
      <div>
        <label className="text-xs text-slate-400 block mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-700 text-slate-100 rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-slate-400 block mb-1">Site</label>
        <div className="flex gap-2">
          {(["left", "right"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSite(s)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                site === s
                  ? "bg-sky-500 text-white"
                  : "bg-slate-700 text-slate-300"
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
          className="flex-1 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg text-sm font-medium bg-slate-700 text-slate-300"
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
      {/* Header actions */}
      <div className="flex gap-2 px-4 pt-4 pb-2">
        <button
          onClick={handleExport}
          className="flex-1 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700"
        >
          Export JSON
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700"
        >
          Import JSON
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
        <p className="text-xs text-red-400 px-4 pb-2">{importError}</p>
      )}

      {/* Injection list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {injections.length === 0 ? (
          <p className="text-slate-500 text-center mt-12">No injection history</p>
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
                  className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{siteLabel(injection.site)}</p>
                    <p className="text-sm text-slate-400">{formatDate(injection.date)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(injection.id)}
                      className="text-xs text-sky-400 px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(injection.id)}
                      className="text-xs text-red-400 px-2 py-1"
                    >
                      Delete
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
