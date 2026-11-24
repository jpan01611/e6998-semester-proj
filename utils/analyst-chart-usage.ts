"use client";

export type AnalystChartUsageEvent = {
  id: string;
  created_at: string;
  type: "chart_expand" | "chart_return";
  page: string;
  chart: "score" | "engagement" | "participation";
};

const STORAGE_KEY = "lol-report-chart-usage-v1";
const MAX_EVENTS = 500;

const getStoredEvents = (): AnalystChartUsageEvent[] => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as AnalystChartUsageEvent[]) : [];
  } catch {
    return [];
  }
};

export const recordAnalystEvent = (
  event: Omit<AnalystChartUsageEvent, "id" | "created_at">,
) => {
  const events = getStoredEvents();
  events.push({
    ...event,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    created_at: new Date().toISOString(),
  });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
};
