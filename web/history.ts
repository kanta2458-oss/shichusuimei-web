import type { ChartInput } from "../src/index.js";
import type { ChartSummary } from "./chartForm.js";

export interface SavedChartHistoryItem {
  id: string;
  createdAt: string;
  displayName?: string;
  input: ChartInput;
  summary: ChartSummary;
}

export interface BrowserStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const CHART_HISTORY_STORAGE_KEY = "shichusuimei.chartHistory.v1";

export function loadChartHistory(storage: BrowserStorageLike, key = CHART_HISTORY_STORAGE_KEY): SavedChartHistoryItem[] {
  const raw = storage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedChartHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveChartHistory(storage: BrowserStorageLike, items: SavedChartHistoryItem[], key = CHART_HISTORY_STORAGE_KEY): void {
  storage.setItem(key, JSON.stringify(items));
}

export function addChartHistoryItem(
  storage: BrowserStorageLike,
  item: SavedChartHistoryItem,
  key = CHART_HISTORY_STORAGE_KEY
): SavedChartHistoryItem[] {
  const next = [item, ...loadChartHistory(storage, key).filter((existing) => existing.id !== item.id)];
  saveChartHistory(storage, next, key);
  return next;
}

export function deleteChartHistoryItem(storage: BrowserStorageLike, id: string, key = CHART_HISTORY_STORAGE_KEY): SavedChartHistoryItem[] {
  const next = loadChartHistory(storage, key).filter((item) => item.id !== id);
  saveChartHistory(storage, next, key);
  return next;
}

export function clearChartHistory(storage: BrowserStorageLike, key = CHART_HISTORY_STORAGE_KEY): void {
  storage.removeItem(key);
}
