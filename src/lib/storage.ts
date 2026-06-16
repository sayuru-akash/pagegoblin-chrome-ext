import { storage } from "wxt/utils/storage";
import type { PageSignals, AnalysisResult } from "./analysis/types";

export interface RecentRoast {
  url: string;
  domain: string;
  signals: PageSignals;
  goblinScore: number;
  verdict: string;
  biggestCrime: string;
  timestamp: number;
}

export interface Preferences {
  autoOpenFullRoast: boolean;
}

const recentRoastsKey = "local:recentRoasts" as const;
const preferencesKey = "local:preferences" as const;

const DEFAULT_PREFERENCES: Preferences = {
  autoOpenFullRoast: false,
};

export async function getRecentRoasts(): Promise<RecentRoast[]> {
  return (await storage.getItem<RecentRoast[]>(recentRoastsKey)) ?? [];
}

export async function addRecentRoast(
  signals: PageSignals,
  result: AnalysisResult
): Promise<void> {
  const roasts = await getRecentRoasts();
  const entry: RecentRoast = {
    url: signals.url,
    domain: new URL(signals.url).hostname,
    signals,
    goblinScore: result.goblinScore,
    verdict: result.verdict,
    biggestCrime: result.biggestCrime,
    timestamp: Date.now(),
  };
  roasts.unshift(entry);
  // Keep only last 10
  await storage.setItem(recentRoastsKey, roasts.slice(0, 10));
}

export async function clearRecentRoasts(): Promise<void> {
  await storage.removeItem(recentRoastsKey);
}

export async function getPreferences(): Promise<Preferences> {
  return (await storage.getItem<Preferences>(preferencesKey)) ?? DEFAULT_PREFERENCES;
}

export async function setPreferences(prefs: Partial<Preferences>): Promise<void> {
  const current = await getPreferences();
  await storage.setItem(preferencesKey, { ...current, ...prefs });
}
