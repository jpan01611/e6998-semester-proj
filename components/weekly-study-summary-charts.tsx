"use client";

import { useState, type MouseEvent } from "react";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

export type WeeklyStudyChartRow = {
  study_id: number;
  study_label: string;
  weighted_score_pct: number;
  total_votes: number;
  caption_count: number;
  votes_per_caption: number;
};

type WeeklyStudySummaryChartsProps = {
  data: WeeklyStudyChartRow[];
  visibleCharts?: ChartType[];
  showHeader?: boolean;
};

type ChartType = "score" | "engagement" | "participation";

const COLORS = {
  grid: "rgba(148, 163, 184, 0.28)",
  axis: "#64748b",
  weighted: "#ec4899",
  totalVotes: "#f97316",
  votesPerCaption: "#14b8a6",
  withVotes: "#f43f5e",
  scatter: "#f59e0b",
};

const toNumeric = (value: unknown) => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number.parseFloat(value);
  }

  return Number.NaN;
};

const formatPercent = (value: unknown) => {
  const numeric = toNumeric(value);
  if (!Number.isFinite(numeric)) {
    return "n/a";
  }

  return `${numeric.toFixed(2)}%`;
};

const formatNumber = (value: unknown) => {
  const numeric = toNumeric(value);
  if (!Number.isFinite(numeric)) {
    return "n/a";
  }

  return numeric.toLocaleString();
};

const scoreLegendName = (key: string) => {
  if (key === "weighted_score_pct") {
    return "Weighted score";
  }

  return key;
};

const engagementLegendName = (key: string) => {
  if (key === "total_votes") {
    return "Total votes";
  }
  if (key === "caption_count") {
    return "Captions";
  }
  if (key === "votes_per_caption") {
    return "Votes / caption";
  }

  return key;
};

function ChartLegend({
  items,
}: {
  items: Array<{ label: string; color: string }>;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 pt-3 text-xs" aria-label="Chart legend">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  );
}

export function WeeklyStudySummaryCharts({
  data,
  visibleCharts = ["score", "engagement", "participation"],
  showHeader = true,
}: WeeklyStudySummaryChartsProps) {
  const [expandedChart, setExpandedChart] = useState<ChartType | null>(null);

  const handleReturn = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setExpandedChart(null);
  };

  if (data.length === 0) {
    return (
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Charts</h2>
        <p className="app-muted text-sm">
          No studies available for chart rendering.
        </p>
      </section>
    );
  }

  const expanded = expandedChart !== null;
  const chartCardClass = (chart: ChartType) =>
    expandedChart === chart
      ? "app-chart-card fixed left-4 right-4 top-4 z-50 max-h-[calc(100vh-2rem)] overflow-auto rounded-xl p-5 shadow-2xl sm:left-8 sm:right-8 sm:top-8"
      : expanded
        ? "app-chart-card rounded-xl p-4 opacity-40"
        : "app-chart-card cursor-pointer rounded-xl p-4 transition hover:-translate-y-0.5 hover:shadow-lg";
  const chartHeight = expandedChart ? "h-[min(52vh,30rem)]" : "h-72";
  const axisTick = { angle: -35, textAnchor: "end" as const, fontSize: expandedChart ? 12 : 10 };
  const chartMargin = { top: 10, right: 20, bottom: expandedChart ? 60 : 50, left: 0 };

  return (
    <section className="space-y-4">
      {showHeader ? (
        <header className="space-y-1">
          <h2 className="text-lg font-semibold">Charts</h2>
          <p className="app-muted text-sm">
            Visual trends for score quality, engagement, and participation. Click a chart to expand
            it and inspect long study names more clearly.
          </p>
        </header>
      ) : null}

      {expanded ? (
        <button
          type="button"
          aria-label="Close expanded chart"
          className="fixed inset-0 z-40 cursor-default bg-background"
          onClick={() => setExpandedChart(null)}
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {visibleCharts.includes("score") && (expandedChart === null || expandedChart === "score") ? (
        <article
          className={chartCardClass("score")}
          role="button"
          tabIndex={0}
          aria-label="Expand score trend chart"
          onClick={() => setExpandedChart(expandedChart === "score" ? null : "score")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setExpandedChart(expandedChart === "score" ? null : "score");
            }
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Score Trend by Study</h3>
              <p className="app-muted mt-1 text-xs">Weighted score only.</p>
            </div>
            {expandedChart === "score" ? (
              <button
                type="button"
                className="app-button shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={handleReturn}
              >
                Return
              </button>
            ) : null}
          </div>
          <div
            className={`mt-3 ${chartHeight} w-full min-w-0 overflow-x-auto`}
            onClick={(event) => event.stopPropagation()}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={chartMargin}
                accessibilityLayer
              >
                <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                <XAxis dataKey="study_label" stroke={COLORS.axis} tick={axisTick} />
                <YAxis
                  stroke={COLORS.axis}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatPercent(value),
                    scoreLegendName(typeof name === "string" ? name : ""),
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="weighted_score_pct"
                  stroke={COLORS.weighted}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend items={[{ label: "Weighted score", color: COLORS.weighted }]} />
        </article>
        ) : null}

        {visibleCharts.includes("engagement") && (expandedChart === null || expandedChart === "engagement") ? (
        <article
          className={chartCardClass("engagement")}
          role="button"
          tabIndex={0}
          aria-label="Expand engagement mix chart"
          onClick={() => setExpandedChart(expandedChart === "engagement" ? null : "engagement")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setExpandedChart(expandedChart === "engagement" ? null : "engagement");
            }
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Engagement Mix</h3>
              <p className="app-muted mt-1 text-xs">
                Total votes, caption count, and votes per caption.
              </p>
            </div>
            {expandedChart === "engagement" ? (
              <button
                type="button"
                className="app-button shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={handleReturn}
              >
                Return
              </button>
            ) : null}
          </div>
          <div
            className={`mt-3 ${chartHeight} w-full min-w-0 overflow-x-auto`}
            onClick={(event) => event.stopPropagation()}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={chartMargin}
                accessibilityLayer
              >
                <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                <XAxis dataKey="study_label" stroke={COLORS.axis} tick={axisTick} />
                <YAxis
                  yAxisId="left"
                  stroke={COLORS.axis}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke={COLORS.axis}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => Number(value).toFixed(1)}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const dataKey = typeof name === "string" ? name : "";
                    if (dataKey === "votes_per_caption") {
                      const numeric = toNumeric(value);
                      return [
                        Number.isFinite(numeric) ? numeric.toFixed(2) : "n/a",
                        engagementLegendName(dataKey),
                      ];
                    }

                    return [formatNumber(value), engagementLegendName(dataKey)];
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="total_votes"
                  fill={COLORS.totalVotes}
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
                <Bar
                  yAxisId="left"
                  dataKey="caption_count"
                  fill={COLORS.withVotes}
                  radius={[4, 4, 0, 0]}
                  barSize={14}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="votes_per_caption"
                  stroke={COLORS.votesPerCaption}
                  strokeWidth={3}
                  dot={{ r: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend
            items={[
              { label: "Captions", color: COLORS.withVotes },
              { label: "Total votes", color: COLORS.totalVotes },
              { label: "Votes / caption", color: COLORS.votesPerCaption },
            ]}
          />
        </article>
        ) : null}

        {visibleCharts.includes("participation") && (expandedChart === null || expandedChart === "participation") ? (
        <article
          className={chartCardClass("participation")}
          role="button"
          tabIndex={0}
          aria-label="Expand participation versus score chart"
          onClick={() => setExpandedChart(expandedChart === "participation" ? null : "participation")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setExpandedChart(expandedChart === "participation" ? null : "participation");
            }
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Participation vs Score</h3>
              <p className="app-muted mt-1 text-xs">
                Captions on x-axis, weighted score on y-axis, bubble size by total votes.
              </p>
            </div>
            {expandedChart === "participation" ? (
              <button
                type="button"
                className="app-button shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={handleReturn}
              >
                Return
              </button>
            ) : null}
          </div>
          <div
            className={`mt-3 ${chartHeight} w-full min-w-0 overflow-x-auto`}
            onClick={(event) => event.stopPropagation()}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={chartMargin}
                accessibilityLayer
              >
                <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="caption_count"
                  name="Captions"
                  stroke={COLORS.axis}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="weighted_score_pct"
                  name="Weighted score"
                  stroke={COLORS.axis}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <ZAxis type="number" dataKey="total_votes" range={[60, 420]} name="Total votes" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(value, name) => {
                    const key = String(name);
                    if (key === "weighted_score_pct") {
                      return [formatPercent(value), "Weighted score"];
                    }

                    return [formatNumber(value), key === "caption_count" ? "Captions" : "Total votes"];
                  }}
                  labelFormatter={(_, payload) => {
                    const point = payload?.[0]?.payload as WeeklyStudyChartRow | undefined;
                    return point ? `Study ${point.study_id} (${point.study_label})` : "";
                  }}
                />
                <Scatter name="Studies" data={data} fill={COLORS.scatter} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </article>
        ) : null}
      </div>
    </section>
  );
}
