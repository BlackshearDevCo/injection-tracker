import { useCallback, useSyncExternalStore } from "react";
import type { Injection, InjectionSite } from "../types";

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
  return new Date().toISOString().split("T")[0];
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

  // Sorted newest first
  const sorted = [...injections].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latest = sorted[0] ?? null;

  const add = useCallback(
    (site: InjectionSite): { warning?: string } => {
      const today = getTodayDate();
      const current = getStoredInjections();
      const existingToday = current.find((i) => i.date === today);

      const entry: Injection = { id: generateId(), date: today, site };
      saveInjections([...current, entry]);

      if (existingToday) {
        return {
          warning: `You already logged an injection today (${existingToday.site} thigh). A second entry has been added.`,
        };
      }
      return {};
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

  const importData = useCallback((json: string): { error?: string } => {
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) return { error: "Invalid format: expected an array" };
      for (const item of parsed) {
        if (!item.id || !item.date || !item.site) {
          return { error: "Invalid format: each entry needs id, date, and site" };
        }
      }
      saveInjections(parsed);
      return {};
    } catch {
      return { error: "Invalid JSON" };
    }
  }, []);

  return { injections: sorted, latest, add, update, remove, exportData, importData };
}
