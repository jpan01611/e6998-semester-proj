import { TopNavbar } from "@/components/top-navbar";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

const NEW_STYLE_MIN_STUDY_ID = 7;
const DASHBOARD_STUDY_LOOKBACK = 25;

type DashboardStudy = {
  id: number;
  slug: string | null;
  description: string | null;
};

type StudyActivity = {
  captionCount: number;
  navigationEvents: number;
  voteEvents: number;
  participantCount: number;
};

const getStudyLabel = (study: DashboardStudy) =>
  study.slug ? `${study.id} - ${study.slug}` : study.description ? `${study.id} - ${study.description}` : `Study ${study.id}`;

const getStudyActivity = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  studyId: number,
): Promise<StudyActivity> => {
  const { data: mappings, error: mappingError } = await supabase
    .from("study_caption_mappings")
    .select("id")
    .eq("study_id", studyId);

  if (mappingError) throw new Error(`Unable to load study captions: ${mappingError.message}`);
  const mappingIds = (mappings ?? []).map((mapping) => mapping.id);
  if (mappingIds.length === 0) {
    return { captionCount: 0, navigationEvents: 0, voteEvents: 0, participantCount: 0 };
  }

  const [{ data: navigationRows, error: navigationError }, { data: voteRows, error: voteError }] =
    await Promise.all([
      supabase
        .from("study_caption_navigation_events")
        .select("profile_id")
        .in("study_caption_mapping_id", mappingIds),
      supabase
        .from("study_caption_vote_events")
        .select("profile_id")
        .in("study_caption_mapping_id", mappingIds),
    ]);

  if (navigationError) throw new Error(`Unable to load study navigation activity: ${navigationError.message}`);
  if (voteError) throw new Error(`Unable to load study vote activity: ${voteError.message}`);

  const participantIds = new Set([
    ...(navigationRows ?? []).map((row) => row.profile_id),
    ...(voteRows ?? []).map((row) => row.profile_id),
  ]);

  return {
    captionCount: mappingIds.length,
    navigationEvents: navigationRows?.length ?? 0,
    voteEvents: voteRows?.length ?? 0,
    participantCount: participantIds.size,
  };
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [
    { data: studies, error: studiesError },
    { data: newStyleStudies, error: newStyleStudiesError },
  ] = await Promise.all([
    supabase.from("studies").select("id, slug, description").order("id", { ascending: false }).limit(DASHBOARD_STUDY_LOOKBACK),
    supabase
      .from("studies")
      .select("id, slug, description")
      .gte("id", NEW_STYLE_MIN_STUDY_ID)
      .order("id", { ascending: false })
      .limit(DASHBOARD_STUDY_LOOKBACK),
  ]);

  if (studiesError) {
    throw new Error(`Unable to load studies: ${studiesError.message}`);
  }

  if (newStyleStudiesError) {
    throw new Error(`Unable to load new style studies: ${newStyleStudiesError.message}`);
  }

  const latestStudy = studies?.[0] ?? null;
  const latestStudyId = latestStudy?.id ?? null;
  const latestNewStyleStudy = newStyleStudies?.[0] ?? null;
  const latestNewStyleStudyId = latestNewStyleStudy?.id ?? null;
  const studyActivityEntries = await Promise.all(
    (studies ?? []).map(async (study) => [study.id, await getStudyActivity(supabase, study.id)] as const),
  );
  const studyActivityById = new Map(studyActivityEntries);
  const latestStudyActivity = latestStudyId ? studyActivityById.get(latestStudyId) : null;
  const latestActiveStudy = (studies ?? []).find((study) => {
    const activity = studyActivityById.get(study.id);
    return activity && (activity.navigationEvents > 0 || activity.voteEvents > 0);
  });
  const additionalReports = [
    {
      title: "Study detail",
      description: "Review study vote details",
      href: latestStudyId ? `/study/${latestStudyId}/study-detail` : null,
    },
    {
      title: "Study engagement risk",
      description: "Find low-engagement raters",
      href: latestStudyId ? `/study/${latestStudyId}/engagement-risk` : null,
    },
    {
      title: "Study-to-study comparison",
      description: "Compare two studies",
      href: "/reports/study-comparison",
    },
    {
      title: "Weekly humor study summary",
      description: "Track weekly study trends",
      href: "/reports/weekly-study-summary",
    },
    {
      title: "Study voting span by user",
      description: "Review voting duration",
      href: latestStudyId ? `/study/${latestStudyId}/vote-timing` : null,
    },
    {
      title: "Study upvote percentage by user",
      description: "Compare individual upvote rates",
      href: latestStudyId ? `/study/${latestStudyId}/user-upvote-rate` : null,
    },
    {
      title: "Selected user report",
      description: "Analyze selected raters together",
      href: latestStudyId ? `/study/${latestStudyId}/selected-user-report` : null,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavbar />
      <main className="page-shell flex-1 flex items-center justify-center p-6">
        <section className="app-panel w-full max-w-2xl rounded-2xl p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="app-kicker text-xs font-semibold uppercase tracking-[0.24em]">
                Humor Study Stats
              </p>
              <h1 className="mt-3 text-3xl font-semibold">Dashboard</h1>
            </div>
          </div>

          <p className="app-muted mt-3 text-sm">
            Signed in as <span className="font-semibold text-foreground">{user?.email}</span>
          </p>

          <div className="mt-8">
            {latestNewStyleStudyId ? (
              <Link
                href={`/study/${latestNewStyleStudyId}/new-style-report`}
                className="app-button app-button-primary mx-auto flex min-h-20 max-w-md items-center justify-center rounded-2xl px-6 py-5 text-center text-2xl font-semibold tracking-tight transition sm:text-3xl"
              >
                Latest Study
              </Link>
            ) : (
              <span className="app-button mx-auto flex min-h-20 max-w-md cursor-not-allowed items-center justify-center rounded-2xl px-6 py-5 text-center text-2xl font-semibold tracking-tight opacity-60 sm:text-3xl">
                Latest Study
              </span>
            )}
          </div>

          {latestStudy && latestStudyActivity ? (
            <section className="app-card mt-4 rounded-xl p-4" aria-live="polite">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="app-kicker text-xs font-semibold uppercase tracking-wide">
                    Study readiness
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">{getStudyLabel(latestStudy)}</h2>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    latestStudyActivity.navigationEvents > 0 || latestStudyActivity.voteEvents > 0
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                  }`}
                >
                  {latestStudyActivity.navigationEvents > 0 || latestStudyActivity.voteEvents > 0
                    ? "Activity recorded"
                    : "Awaiting activity"}
                </span>
              </div>
              <p className="app-muted mt-2 text-sm">
                {latestStudyActivity.navigationEvents > 0 || latestStudyActivity.voteEvents > 0
                  ? "Participant activity is available for this study."
                  : "This study has captions, but no participant activity has been recorded yet."}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div><dt className="app-muted">Captions</dt><dd className="mt-1 font-semibold">{latestStudyActivity.captionCount.toLocaleString()}</dd></div>
                <div><dt className="app-muted">Navigation events</dt><dd className="mt-1 font-semibold">{latestStudyActivity.navigationEvents.toLocaleString()}</dd></div>
                <div><dt className="app-muted">Votes</dt><dd className="mt-1 font-semibold">{latestStudyActivity.voteEvents.toLocaleString()}</dd></div>
                <div><dt className="app-muted">Participants</dt><dd className="mt-1 font-semibold">{latestStudyActivity.participantCount.toLocaleString()}</dd></div>
              </dl>
              {latestActiveStudy && latestActiveStudy.id !== latestStudyId ? (
                <Link
                  href={`/study/${latestActiveStudy.id}/new-style-report`}
                  className="app-button mt-4 inline-flex rounded-lg px-3 py-2 text-sm font-medium transition"
                >
                  Open latest study with activity
                </Link>
              ) : null}
            </section>
          ) : null}

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <details className="group ml-auto flex w-full max-w-lg flex-col items-end">
              <summary className="app-button order-2 flex cursor-pointer list-none items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition marker:content-none">
                <span className="group-open:hidden">More reports</span>
                <span className="hidden group-open:inline">Hide reports</span>
                <span className="text-xs group-open:hidden" aria-hidden="true">
                  &#9660;
                </span>
                <span className="hidden text-xs group-open:inline" aria-hidden="true">
                  &#9650;
                </span>
              </summary>
              <div className="app-card order-1 mb-3 grid w-full gap-2 rounded-xl p-3 sm:grid-cols-2">
                {additionalReports.map((reportOption) =>
                  reportOption.href ? (
                    <Link
                      key={reportOption.title}
                      href={reportOption.href}
                      className="app-button rounded-lg px-3 py-2 text-sm transition"
                    >
                      <span className="block font-medium">{reportOption.title}</span>
                      <span className="app-muted mt-0.5 block text-xs">
                        {reportOption.description}
                      </span>
                    </Link>
                  ) : (
                    <span
                      key={reportOption.title}
                      className="app-button cursor-not-allowed rounded-lg px-3 py-2 text-sm opacity-60"
                    >
                      <span className="block font-medium">{reportOption.title}</span>
                      <span className="app-muted mt-0.5 block text-xs">
                        {reportOption.description}
                      </span>
                    </span>
                  ),
                )}
              </div>
            </details>
          </div>
        </section>
      </main>
    </div>
  );
}
