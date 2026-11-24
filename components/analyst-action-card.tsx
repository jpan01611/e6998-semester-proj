type AnalystActionCardProps = {
  status: "ready" | "investigate" | "wait";
  finding: string;
  action: string;
  caution: string;
};

const statusStyles = {
  ready: "border-emerald-400",
  investigate: "border-amber-400",
  wait: "border-sky-400",
};

export function AnalystActionCard({
  status,
  finding,
  action,
  caution,
}: AnalystActionCardProps) {
  return (
    <aside className={`app-card rounded-xl border-l-4 p-4 ${statusStyles[status]}`}>
      <p className="app-kicker text-xs font-semibold uppercase tracking-wide">
        What should you do?
      </p>
      <dl className="mt-3 grid gap-3 text-sm md:grid-cols-3">
        <div>
          <dt className="font-semibold">Finding</dt>
          <dd className="app-muted mt-1">{finding}</dd>
        </div>
        <div>
          <dt className="font-semibold">Recommended next step</dt>
          <dd className="app-muted mt-1">{action}</dd>
        </div>
        <div>
          <dt className="font-semibold">Confidence caveat</dt>
          <dd className="app-muted mt-1">{caution}</dd>
        </div>
      </dl>
    </aside>
  );
}
