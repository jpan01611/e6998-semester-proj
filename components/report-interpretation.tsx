type ReportInterpretationProps = {
  title?: string;
  points: string[];
};

export function ReportInterpretation({
  title = "How to read this report",
  points,
}: ReportInterpretationProps) {
  return (
    <aside className="app-card rounded-xl border-l-4 border-cyan-400 p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="app-muted mt-3 grid gap-2 text-sm md:grid-cols-2">
        {points.map((point) => (
          <li key={point} className="flex gap-2">
            <span className="text-cyan-500" aria-hidden="true">
              •
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
