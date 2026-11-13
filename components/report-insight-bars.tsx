type ReportInsightBarItem = {
  label: string;
  value: number;
  displayValue: string;
  colorClassName?: string;
};

type ReportInsightBarsProps = {
  title: string;
  description: string;
  items: ReportInsightBarItem[];
  maxValue?: number;
};

export function ReportInsightBars({
  title,
  description,
  items,
  maxValue,
}: ReportInsightBarsProps) {
  const resolvedMax = maxValue ?? Math.max(...items.map((item) => item.value), 1);

  return (
    <section className="app-card rounded-xl p-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="app-muted mt-1 text-sm">{description}</p>
      </div>
      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map((item) => {
            const width = Math.min(100, Math.max(0, (item.value / resolvedMax) * 100));
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate">{item.label}</span>
                  <span className="shrink-0 font-semibold">{item.displayValue}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/70">
                  <div
                    className={`h-full rounded-full ${
                      item.colorClassName ?? "bg-cyan-500"
                    }`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="app-muted mt-4 text-sm">No data is available for this view.</p>
      )}
    </section>
  );
}
