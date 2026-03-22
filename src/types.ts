export type InjectionSite = "left" | "right";

export interface Injection {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  site: InjectionSite;
}
