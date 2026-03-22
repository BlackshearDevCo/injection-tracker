import { useCallback, useSyncExternalStore } from "react";
import type { Injection, InjectionSite, ImportConflict, ImportResult } from "../types";

const STORAGE_KEY = "injection-tracker-data";

function getStoredInjections(): Injection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveInjections(injections: Injection[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(injections));
  window.dispatchEvent(new Event("injections-changed"));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("injections-changed", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("injections-changed", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "[]";
}

export function useInjections() {
  const raw = useSyncExternalStore(subscribe, getSnapshot);
  const injections: Injection[] = JSON.parse(raw);

  // Sorted newest first; use id (timestamp-based) as tiebreaker for same-day entries
  const sorted = [...injections].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id.localeCompare(a.id)
  );

  const latest = sorted[0] ?? null;

  const checkDuplicate = useCallback((): Injection | null => {
    const today = getTodayDate();
    const current = getStoredInjections();
    return current.find((i) => i.date === today) ?? null;
  }, []);

  const add = useCallback(
    (site: InjectionSite, date?: string, id?: string): void => {
      const current = getStoredInjections();
      const entry: Injection = { id: id ?? generateId(), date: date ?? getTodayDate(), site };
      saveInjections([...current, entry]);
    },
    []
  );

  const update = useCallback((id: string, updates: Partial<Omit<Injection, "id">>) => {
    const current = getStoredInjections();
    saveInjections(
      current.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  }, []);

  const remove = useCallback((id: string) => {
    const current = getStoredInjections();
    saveInjections(current.filter((i) => i.id !== id));
  }, []);

  const exportData = useCallback((): string => {
    return JSON.stringify(getStoredInjections(), null, 2);
  }, []);

  const importData = useCallback((json: string): ImportResult => {
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) return { error: "Invalid format: expected an array" };
      for (const item of parsed) {
        if (!item.id || !item.date || !item.site) {
          return { error: "Invalid format: each entry needs id, date, and site" };
        }
      }

      const current = getStoredInjections();
      const currentByDate = new Map<string, Injection>();
      for (const entry of current) {
        currentByDate.set(entry.date, entry);
      }

      let added = 0;
      let skipped = 0;
      const conflicts: ImportConflict[] = [];
      const toAdd: Injection[] = [];

      for (const imported of parsed as Injection[]) {
        const existing = currentByDate.get(imported.date);
        if (!existing) {
          toAdd.push(imported);
          added++;
        } else if (existing.site === imported.site) {
          skipped++;
        } else {
          conflicts.push({ date: imported.date, current: existing, imported });
        }
      }

      if (toAdd.length > 0) {
        saveInjections([...current, ...toAdd]);
      }

      return { added, skipped, conflicts };
    } catch {
      return { error: "Invalid JSON" };
    }
  }, []);

  const resolveConflict = useCallback((date: string, keepImported: boolean, imported: Injection) => {
    const current = getStoredInjections();
    if (keepImported) {
      saveInjections(current.map((i) => i.date === date ? { ...i, site: imported.site } : i));
    }
    // If keeping current, no change needed
  }, []);

  return { injections: sorted, latest, checkDuplicate, add, update, remove, exportData, importData, resolveConflict };
}
