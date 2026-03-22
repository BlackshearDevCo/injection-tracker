export type InjectionSite = "left" | "right";

export interface Injection {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  site: InjectionSite;
}

export interface ImportConflict {
  date: string;
  current: Injection;
  imported: Injection;
}

export interface ImportResult {
  error?: string;
  added?: number;
  skipped?: number;
  conflicts?: ImportConflict[];
}
