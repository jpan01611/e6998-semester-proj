import { TopNavbar } from "@/components/top-navbar";
import { ReportNavigation } from "@/components/report-navigation";
import { ReportIdentity } from "@/components/report-identity";
import { AnalystActionCard } from "@/components/analyst-action-card";
import {
  WeeklyStudySummaryCharts,
  type WeeklyStudyChartRow,
} from "@/components/weekly-study-summary-charts";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

const NEW_STYLE_MIN_STUDY_ID = 7;
const DASHBOARD_STUDY_LOOKBACK = 8;

type DashboardStudy = {
  id: number;
  slug: string | null;
  description: string | null;
};

type StudyActivity = {
  captionCount: number;
  navigationEvents: number;
  voteEvents: number;
  upvotes: number;
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
    return { captionCount: 0, navigationEvents: 0, voteEvents: 0, upvotes: 0, participantCount: 0 };
  }

  const [{ data: navigationRows, error: navigationError }, { data: voteRows, error: voteError }] =
    await Promise.all([
      supabase
        .from("study_caption_navigation_events")
        .select("profile_id")
        .in("study_caption_mapping_id", mappingIds),
      supabase
        .from("study_caption_vote_events")
        .select("profile_id, vote_value")
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
    upvotes: (voteRows ?? []).filter((row) =>
      ["up", "upvote", "like", "liked", "1", "true"].includes(String(row.vote_value).toLowerCase()),
    ).length,
    participantCount: participantIds.size,
  };
};

export default async function Home() {
  const supabase = await createClient();
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
  const chartRows: WeeklyStudyChartRow[] = (studies ?? []).map((study) => {
    const activity = studyActivityById.get(study.id);
    const totalVotes = activity?.voteEvents ?? 0;
    return {
      study_id: study.id,
      study_label: study.slug ? study.slug.slice(0, 14) : `S${study.id}`,
      weighted_score_pct: totalVotes > 0 ? ((activity?.upvotes ?? 0) / totalVotes) * 100 : 0,
      total_votes: totalVotes,
      caption_count: activity?.captionCount ?? 0,
      votes_per_caption: (activity?.captionCount ?? 0) > 0
        ? totalVotes / (activity?.captionCount ?? 1)
        : 0,
    };
  });
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavbar />
      <main className="page-shell flex-1 flex items-center justify-center p-6">
        <section className="app-panel w-full max-w-7xl rounded-2xl p-6 sm:p-8">
          <ReportIdentity />

          <div className="mt-6">
            <ReportNavigation currentStudyId={latestNewStyleStudyId} activeHref="/" />
          </div>

          <h1 className="mt-6 text-3xl font-semibold">Dashboard</h1>

          <div className="mt-8">
            <WeeklyStudySummaryCharts
              data={chartRows}
              visibleCharts={["engagement"]}
              showHeader={false}
            />
          </div>

          <div className="mt-6">
            {latestNewStyleStudyId ? (
              <Link
                href="/reports/weekly-study-summary"
                className="app-button app-button-primary mx-auto flex min-h-12 max-w-sm items-center justify-center rounded-xl px-5 py-3 text-center text-xl font-semibold tracking-tight transition sm:text-2xl"
              >
                View all graphs
              </Link>
            ) : (
              <span className="app-button mx-auto flex min-h-12 max-w-sm cursor-not-allowed items-center justify-center rounded-xl px-5 py-3 text-center text-xl font-semibold tracking-tight opacity-60 sm:text-2xl">
                View all graphs
              </span>
            )}
          </div>

          {latestStudy && latestStudyActivity ? (
            <section className="app-card mt-3 rounded-xl p-4" aria-live="polite">
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

          {latestStudy && latestStudyActivity ? (
            <div className="mt-3">
              <AnalystActionCard
                status={
                  latestStudyActivity.navigationEvents === 0 && latestStudyActivity.voteEvents === 0
                    ? "wait"
                    : latestStudyActivity.voteEvents < 30
                      ? "investigate"
                      : "ready"
                }
                finding={
                  latestStudyActivity.navigationEvents === 0 && latestStudyActivity.voteEvents === 0
                    ? "The latest study has no recorded participant activity."
                    : latestStudyActivity.voteEvents < 30
                      ? "Participant activity is present, but recorded vote evidence is limited."
                      : "The latest study has enough recorded activity for an initial analysis review."
                }
                action={
                  latestStudyActivity.navigationEvents === 0 && latestStudyActivity.voteEvents === 0
                    ? "Wait for participant activity or confirm that data collection is functioning before reporting readiness."
                    : latestStudyActivity.voteEvents < 30
                      ? "Check participation coverage and wait for a larger vote sample before making a final study decision."
                      : "Review caption coverage, vote mix, and participant-level outliers before marking the study ready."
                }
                caution={
                  "Activity volume does not prove data quality. Check collection failures and unusual participation patterns too."
                }
              />
            </div>
          ) : null}

        </section>
      </main>
    </div>
  );
}
