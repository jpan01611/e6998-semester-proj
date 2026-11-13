# Semester Project Part 3: Iteration 2
## Revise and review again

**Application:** The LOL Report  
**Deployed application:** [https://e6998-semester-proj.vercel.app/](https://e6998-semester-proj.vercel.app/)  
**Persona:** A humor-study analyst or research administrator who reviews participant responses, determines whether a study is ready for analysis, and produces feedback for the research/development team.

## What changed after the previous iteration

In Iteration 1, I added study-readiness information to explain why a newest study could show zero metrics. The previous PM review found that this was useful but too simple and primarily added details rather than creating a substantial improvement. The PM recommended broader user research, deployment for easier testing, and a more meaningful analytics improvement.

For Iteration 2, I expanded the work from “is this study active?” to “what do these study statistics mean, and how can an analyst compare them confidently?” The main pain point was that analysts could see statistics but could not quickly interpret the metrics, compare studies, or read crowded charts. Zero-activity studies and slow comparison refreshes added further confusion.

## Revised implementation

- Added a study-to-study comparison workspace with:
  - Plain-language explanations of weighted score and like rate.
  - Side-by-side metric comparisons and deltas.
  - Caption coverage, vote volume, overlap, and votes-per-caption context.
  - Sample-size cautions and a reminder that comparison does not establish causation.
  - Filtering for studies with no recorded votes.
- Added a Weekly Summary report with:
  - Score Trend, Engagement Mix, and Participation vs. Score graphs.
  - Clickable chart cards and focused expanded views.
  - Diagonal study labels and separate legends so labels remain readable.
  - A dashboard Engagement Mix preview and a “View all graphs” action.
- Added consistent report navigation across the dashboard and study reports.
- Added “How to read this report” interpretation guidance to the latest-study, study-detail, engagement-risk, user-upvote-rate, vote-timing, selected-user, comparison, and weekly-summary views.
- Added intuitive visual summaries to several detailed reports:
  - Vote-mix bars in Study Detail.
  - Top-user upvote-rate bars.
  - Voting-span bars.
  - Low/medium/high engagement-risk distribution bars.
- Improved the vote-time histogram so its slider extends slightly beyond the maximum observed vote time in the selected study.
- Optimized Study Comparison refreshes to:
  - Load detailed mappings and votes only for the selected pair.
  - Avoid unnecessary all-study activity checks when inactive studies are explicitly shown.
  - Use bounded parallel query processing and transition feedback.
  - Allow Refresh to revalidate the same study pair.

## Review of the revised version

I checked the revised workflow against the original problem by reviewing:

1. The dashboard with an inactive newest study.
2. The latest-study report and its activity explanation.
3. Study Detail and its vote-time filter.
4. Study Comparison with different study selections and Refresh.
5. Weekly Summary charts, scrolling through the charts and opening an expanded graph.
6. The user-level and engagement-risk reports with their new summary visuals.

The revised version now distinguishes missing participant activity from a failed report, gives analysts an explanation before the detailed tables, and provides visual context before requiring them to interpret raw rows. I also checked for confusing behavior introduced by the changes: expanded charts remain focused on one graph, Return closes the expanded view in place, the comparison Refresh control shows a loading state, and detailed tables remain available below the summary cards.

Validation completed with targeted ESLint, TypeScript validation, `npm run build`, and `git diff --check`. The deployed application may require Google sign-in with an authorized superadmin account.

## Second Product Manager review feedback

Bradley's feedback emphasized that the reports should provide more graphs and more intuitive summary statistics instead of asking analysts to interpret dense tables first. The revised demonstration therefore focused on whether the new graphs and interpretation cards made the reports easier to scan than the previous table-first experience. The feedback and remaining review questions are:

- Which summary visualizations are most useful for analysts in their first thirty seconds?
- Should analysts be able to customize or export the charts?
- Do the interpretation notes provide enough context without making the reports feel too dense?
- Does Study Comparison become fast enough with larger studies and real deployed data?

## Next iteration plan

- Collect and prioritize feedback from analysts using the deployed workflow.
- Measure comparison refresh time with representative large studies and further reduce query cost if needed.
- Refine chart labels, defaults, and visual density based on which graphs users actually use.
- Consider adding export/share support for comparison results if analysts need to communicate findings outside the application.
- Re-test the inactive-study, comparison, and chart-detail flows after the next changes to ensure interpretability improvements do not introduce new ambiguity.
