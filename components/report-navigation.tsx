import Link from "next/link";

type ReportNavigationProps = {
  currentStudyId: number | null;
  activeHref?: string;
};

const getStudyHref = (currentStudyId: number | null, suffix: string) =>
  currentStudyId === null ? null : `/study/${currentStudyId}/${suffix}`;

export function ReportNavigation({ currentStudyId, activeHref }: ReportNavigationProps) {
  const tabs = [
    { label: "Dashboard", href: "/" },
    { label: "Latest study", href: getStudyHref(currentStudyId, "new-style-report") },
    { label: "Study detail", href: getStudyHref(currentStudyId, "study-detail") },
    { label: "Compare studies", href: "/reports/study-comparison" },
    { label: "Weekly summary", href: "/reports/weekly-study-summary" },
    { label: "Engagement risk", href: getStudyHref(currentStudyId, "engagement-risk") },
    { label: "User upvote rate", href: getStudyHref(currentStudyId, "user-upvote-rate") },
    { label: "Vote timing", href: getStudyHref(currentStudyId, "vote-timing") },
    { label: "Selected users", href: getStudyHref(currentStudyId, "selected-user-report") },
  ];

  return (
    <nav aria-label="Study reports" className="border-b border-slate-200/70 dark:border-slate-700/70">
      <div className="-mb-px flex gap-1 overflow-x-auto py-1">
        {tabs.map((tab) =>
          tab.href ? (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={activeHref === tab.href ? "page" : undefined}
              className={`shrink-0 rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium transition ${
                activeHref === tab.href
                  ? "border-cyan-400 text-cyan-600 dark:text-cyan-300"
                  : "border-transparent app-muted hover:border-slate-300 hover:text-foreground dark:hover:border-slate-600"
              }`}
            >
              {tab.label}
            </Link>
          ) : null,
        )}
      </div>
    </nav>
  );
}
