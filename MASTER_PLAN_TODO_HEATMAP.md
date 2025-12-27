Master Plan: Sanity Todos + Heatmap

Decisions (locked)
- Todo data source: Sanity (published docs only).
- Heatmap meaning: completed tasks per day, grouped by completedAt.
- Range: last 13 weeks (91 days), rolling from today.
- Weighting: priority-based (low=1, medium=3, high=5).
- Backdating: allowed by editing completedAt; heatmap reflects edits on next page load.
- Focus panel: single list showing incomplete tasks (oldest first) plus up to 4 most recently completed tasks.
- Updates: on-the-fly query on page load (no stored day summaries).

Relevant Codebase References
- app/components/hero.tsx (renders Focus panel + heatmap layout)
- app/components/quick-todos.tsx (Focus panel mock list)
- app/components/activity-heatmap.tsx (heatmap mock data + tooltip UI)
- app/lib/sanity.ts (Sanity client + GROQ helpers)
- studio-jeremiah.dev/schemaTypes/index.ts (schema registry)
- studio-jeremiah.dev/schemaTypes/post.ts (schema pattern reference)

Data Model (Sanity)
New document type: todo
- title: string (required)
- status: string (todo | in_progress | done)
- priority: string (low | medium | high)
- completedAt: datetime (required when status == done)
- createdAt: datetime (default to now)

GROQ Queries (published only)
- Focus panel:
  - Incomplete: status != "done" order by createdAt asc
  - Completed: status == "done" order by completedAt desc [0..3]
- Heatmap:
  - Completed todos in last 13 weeks (91 days):
    completedAt >= dateTime(now()) - 90 * 24 * 60 * 60 * 1000 (inclusive window)
  - Map each todo to day key: date(completedAt)
  - Aggregate by day in frontend to compute weighted counts and tooltip task titles

Frontend Data Flow
- app/lib/sanity.ts
  - Add types: Todo, TodoStatus, TodoPriority
  - Add helpers: getFocusTodos, getCompletedTodosForHeatmap
- app/components/quick-todos.tsx
  - Convert to async server component that fetches focus todos.
  - Render incomplete list (oldest first) and up to 4 most-recently-completed items.
- app/components/activity-heatmap.tsx
  - Keep as client component for hover tooltip.
  - Accept precomputed heatmap data via props (serializable shape with ISO dates).
  - Replace mock random data with real aggregation.
- app/components/hero.tsx
  - Fetch heatmap data in a server wrapper or pass props down from a parent.

User Experience & UI
- Focus panel intent: deliver a clean, glanceable snapshot of what is still open and
  what was just completed, without turning the hero area into a dense productivity
  app. The goal is a calm, confident signal of momentum rather than a checklist UI.
- Layout and density: the panel remains a single column with compact rows to preserve
  the current minimal footprint in the hero layout. Items should truncate cleanly,
  keep the existing small type scale, and avoid extra metadata or badges. This keeps
  the focus panel readable at a glance while still fitting the right-column grid.
- Ordering behavior: incomplete tasks are listed first and ordered by createdAt
  ascending (oldest to newest). This emphasizes backlog clarity, makes "longest
  waiting" items visible, and avoids noisy reprioritization on every new entry.
- Completed section: append a subtle divider and label (e.g., "Recently completed")
  followed by up to four tasks, ordered by completedAt descending. This creates a
  short "win reel" that shows progress without overwhelming the incomplete list.
  If there are zero completed tasks, the divider and label are omitted entirely.
- Visual treatment: keep the current circular status indicator and line-through for
  completed items. Completed items use lighter text to preserve hierarchy and avoid
  stealing attention from open tasks. The progress bar should still reflect the
  ratio of completed vs total shown in the panel.
- Heatmap purpose: the heatmap remains a compact, ambient signal of output over
  time. It should feel cinematic and quiet, not analytical. Each cell represents
  the weighted total of completed tasks for that day (priority weight), so a single
  high-priority completion can visibly move the scale.
- Heatmap range and baseline: render exactly the last 13 weeks (91 days, rolling). Days outside
  this range are not shown. Days with zero completed tasks remain visible as the
  lowest intensity, maintaining the weekly rhythm and visual continuity.
- Tooltip behavior: hover reveals the date, the list of completed task titles for
  that day, and the weighted "contribution" count. The tooltip stays compact and
  anchored near the hovered cell, matching the current interaction style.
- Backdating behavior: if a task is edited with a past completedAt, the heatmap will
  reflect that historical date on the next page load. This keeps the timeline honest
  and prevents spikes from retroactive data entry. No special UI is required beyond
  the normal update on refresh.

Aggregation Algorithm (frontend)
- Input: completed todos with completedAt + priority + title
- For each todo:
  - dayKey = completedAt (YYYY-MM-DD)
  - weight = priority map (low=1, medium=3, high=5)
  - Increment day.total by weight
  - Append title to day.tasks
- Output: last 91 days list (fill empty days with zero count)

Implementation Steps
1) Studio schema ✅
   - Add studio-jeremiah.dev/schemaTypes/todo.ts ✅
   - Register in studio-jeremiah.dev/schemaTypes/index.ts ✅
2) Sanity helpers ✅
   - Update app/lib/sanity.ts with todo types + GROQ helpers ✅
3) Focus panel ✅
   - Replace app/components/quick-todos.tsx mock list with Sanity data ✅
4) Heatmap ✅
   - Replace app/components/activity-heatmap.tsx mock data with real props ✅
   - Add aggregation helper (either in component or new app/lib helper) ✅
   - Update range to 13 weeks (91 days) to avoid padding cells ✅
5) Wire-up + QA
   - Ensure published-only filtering ✅
   - Validate backdated edits shift heatmap cells correctly (pending live data)

Notes
- Use ISO strings between server and client; parse dates in client for tooltip formatting.
- Keep UI styling consistent with current dark-first palette and blue accents.
- Updated GROQ date math to use milliseconds (day-based math) and documented alternative fixes.

Problems / Ambiguous Decisions
- Resolved: switch to a 13-week (91-day) range so the grid aligns to full weeks without padding cells.
- GROQ parser rejected the day-suffix syntax (`- 90d`), so we reverted to milliseconds math to keep the 91-day window accurate.
- Alternatives (not chosen): use day suffixes if supported, use `duration("90d")`, or compute an ISO cutoff in JS and pass it into the GROQ query.
