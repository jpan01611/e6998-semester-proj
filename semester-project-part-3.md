# Semester Project Part 3: Iteration 2
## Revise and review again

**Application:** The LOL Report
**Deployed application:** [https://e6998-semester-proj.vercel.app/](https://e6998-semester-proj.vercel.app/)
**Persona:** A humor-study analyst or research administrator who reviews participant responses, determines whether a study is ready for analysis, and produces feedback for the research/development team.

## What changed after the previous iteration

In Iteration 1, I added study-readiness information to explain why a newest study could show zero metrics. The previous PM review found that this was useful but too simple and primarily added details rather than creating a substantial improvement. The PM recommended broader user research, deployment for easier testing, and a more meaningful analytics improvement.

For Iteration 2, I expanded the work from “is this study active?” to “what do these study statistics mean, and how can an analyst compare them confidently?” The main pain point was that analysts could see statistics but could not quickly interpret the metrics, compare studies, or read crowded charts. Zero-activity studies and slow comparison refreshes added further confusion.

## Revised implementation

I added a study-to-study comparison workspace with plain-language explanations of weighted score and like rate, side-by-side metric comparisons and deltas, caption coverage, vote volume, overlap, votes-per-caption context, sample-size cautions, and a reminder that comparison does not establish causation. Analysts can also choose whether to include studies with no recorded votes.

I added a Weekly Summary report with Score Trend, Engagement Mix, and Participation vs. Score graphs. The chart cards can be clicked to open focused expanded views, and diagonal study labels plus separate legends make the graphs easier to read. The dashboard now shows an Engagement Mix preview with a “View all graphs” action.

I standardized report navigation across the dashboard and study reports. I also added “How to read this report” interpretation guidance to the latest-study, study-detail, engagement-risk, user-upvote-rate, vote-timing, selected-user, comparison, and weekly-summary views. These explanations connect each statistic to the analyst’s decision-making task and identify important limitations.

I added intuitive visual summaries to several detailed reports. Study Detail now includes vote-mix bars, User Upvote Rate includes top-user upvote-rate bars, Vote Timing includes voting-span bars, and Engagement Risk includes a low/medium/high risk distribution. The vote-time histogram slider now extends slightly beyond the maximum observed vote time in the selected study.

Finally, I optimized Study Comparison refreshes so detailed mappings and votes are loaded only for the selected pair. The page avoids unnecessary all-study activity checks when inactive studies are explicitly shown, uses bounded parallel query processing and transition feedback, and allows Refresh to revalidate the same study pair.

## Review of the revised version

I checked the revised workflow against the original problem by reviewing the dashboard with an inactive newest study, the latest-study report and its activity explanation, Study Detail and its vote-time filter, Study Comparison with different study selections and Refresh, Weekly Summary charts after scrolling through them and opening an expanded graph, and the user-level and engagement-risk reports with their new summary visuals.

The revised version now distinguishes missing participant activity from a failed report, gives analysts an explanation before the detailed tables, and provides visual context before requiring them to interpret raw rows. I also checked for confusing behavior introduced by the changes. Expanded charts remain focused on one graph, Return closes the expanded view in place, the comparison Refresh control shows a loading state, and detailed tables remain available below the summary cards.

Validation completed with targeted ESLint, TypeScript validation, `npm run build`, and `git diff --check`. The deployed application may require Google sign-in with an authorized superadmin account.

## Second Product Manager review feedback

Bradley's feedback emphasized that the reports should provide more graphs and more intuitive summary statistics instead of asking analysts to interpret dense tables first. The revised demonstration therefore focused on whether the new graphs and interpretation cards made the reports easier to scan than the previous table-first experience. The remaining review questions are which summary visualizations are most useful for analysts in their first thirty seconds, whether analysts should be able to customize or export the charts, whether the interpretation notes provide enough context without making the reports feel too dense, and whether Study Comparison becomes fast enough with larger studies and real deployed data.

## Next iteration plan

In the next iteration, I will collect and prioritize feedback from analysts using the deployed workflow, measure comparison refresh time with representative large studies, and further reduce query cost if needed. I will refine chart labels, defaults, and visual density based on which graphs users actually use. If analysts need to communicate findings outside the application, I will consider adding export or sharing support for comparison results. I will also re-test the inactive-study, comparison, and chart-detail flows after the next changes to ensure that interpretability improvements do not introduce new ambiguity.
