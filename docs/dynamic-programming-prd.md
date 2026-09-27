# Dynamic Programming: 0/1 Knapsack

Status: ready-for-agent

## Problem Statement

The algorithm visualization workbench does not yet let learners inspect how dynamic programming
turns overlapping subproblems into a table of reusable results. A learner needs one focused,
end-to-end experience that shows a meaningful recurrence, the alternatives considered for each
subproblem, the resulting table updates, and the choices reconstructed from the final answer.

Without this, dynamic programming would either be introduced as unexplained arithmetic or require
learners to infer an optimal item selection from a completed table on their own.

## Solution

Add one `DYNAMIC_PROGRAMMING` API family and one 0/1 Knapsack learning experience. A learner
authors a small named item list with integer weights and values, chooses a non-negative capacity,
and plays a backend-produced canonical trace.

The visualizer first explains the zero-item and zero-capacity base cases. It then processes a
bottom-up table whose rows represent the first *i* items and whose columns represent capacity
*w*. For every non-base cell, the learner sees the exclude and include candidates, the recurrence
branch selected, and the committed value. Once the table is complete, playback backtracks from the
final cell and highlights the selected items. Ties deterministically prefer excluding the current
item.

## User Stories

1. As a learner, I want to select a dynamic-programming algorithm in the workbench, so that I can
   explore it alongside the existing algorithm families.
2. As a learner, I want one focused 0/1 Knapsack experience, so that I can learn the core
   dynamic-programming pattern without choosing among unfamiliar variants.
3. As a learner, I want to enter named items with weights and values, so that the optimization
   problem reflects choices I can recognize during playback.
4. As a learner, I want to enter a capacity, so that I can see how the constraint changes the
   subproblems and selected items.
5. As a learner, I want useful default data and curated presets, so that I can begin learning
   immediately and compare meaningful examples.
6. As a learner, I want invalid weight, value, capacity, and item-count inputs explained before a
   run, so that I can correct the draft without guessing why a trace cannot be created.
7. As a learner, I want 0/1 semantics, so that I know every item can be taken at most once.
8. As a learner, I want the base-case row and column explicitly initialized and explained, so that
   I understand where the recurrence begins.
9. As a learner, I want rows to mean the first items considered and columns to mean capacity, so
   that I can read each table cell as a concrete subproblem.
10. As a learner, I want each non-base cell to show the exclude candidate, so that I can see the
    consequence of not taking the current item.
11. As a learner, I want each eligible non-base cell to show the include candidate, so that I can
    see the value gained by taking the current item and using remaining capacity.
12. As a learner, I want ineligible items explained rather than silently treated as candidates,
    so that I understand why an item cannot fit at a given capacity.
13. As a learner, I want a visible decision and committed value for each table cell, so that I can
    distinguish considering a recurrence from updating its answer.
14. As a learner, I want the active cell and its dependencies visibly distinguished without color
    alone, so that I can follow the bottom-up evaluation order.
15. As a learner, I want an event-specific recurrence explanation and matching pseudocode line,
    so that the animation, formula, and implementation idea stay connected.
16. As a learner, I want shared play, pause, previous, next, reset, timeline, and speed controls,
    so that I can inspect each dynamic-programming decision at my own pace.
17. As a learner, I want the final cell to lead into a visible backtracking phase, so that the
    optimal value becomes an actual item selection.
18. As a learner, I want a stable tie rule that excludes the current item, so that replay always
    reconstructs the same valid solution when alternatives have equal value.
19. As a learner, I want the reconstructed item names, total value, and total weight summarized,
    so that I can verify the outcome against my capacity.
20. As a learner, I want an empty selected-item list presented as a valid result when it is
    optimal, so that a zero-value solution is not confused with a failed run.
21. As a learner, I want edits after a run to remain an independent changed draft, so that I can
    compare my pending experiment with the completed trace until I explicitly run again.
22. As a learner switching algorithm families, I want each family to retain its own draft while
    stale playback is cleared, so that experiments are not lost or attributed to the wrong
    algorithm.
23. As a keyboard user, I want to author items, set capacity, start a run, and control playback,
    so that the full learning flow does not require a pointer.
24. As a screen-reader user, I want concise announcements for active updates and backtracking,
    so that playback progress is understandable without watching the animation.
25. As a screen-reader user, I want an inspectable textual/table equivalent of the dynamic table
    and final selection, so that the grid is not the only representation of the trace state.
26. As a motion-sensitive learner, I want reduced-motion behavior applied to cell updates and
    reconstruction highlights, so that the visualizer remains comfortable to use.
27. As a developer, I want a family-discriminated, immutable canonical trace, so that recurrence
    execution is not duplicated or allowed to drift in the frontend.
28. As a developer, I want deterministic event order, snapshots, and reconstructed output, so
    that traces are replayable and regression tests can compare observable behavior reliably.
29. As a developer, I want the new family to leave existing algorithm contracts unchanged, so
    that the milestone is additive and does not regress established learning experiences.

## Implementation Decisions

### Scope and algorithm behavior

- Deliver one complete vertical slice: 0/1 Knapsack with bottom-up tabulation, reconstruction,
  learning content, accessibility, typed contracts, and focused regression coverage. Do not
  introduce memoization or another dynamic-programming problem in this milestone.
- Each authored item has a learner-visible name, a positive integer weight, and a non-negative
  integer value. Capacity is a non-negative integer. An item can be selected at most once.
- Permit 1–10 items and capacity 0–20. These bounds keep the table legible and ensure the
  canonical trace remains well below the existing 10,000-event limit.
- Define the table as `dp[i][w]`: the best value obtainable from the first `i` items with capacity
  `w`. Rows run from zero items through all authored items; columns run from zero capacity through
  the authored capacity.
- Initialize all `dp[0][w]` and `dp[i][0]` base cases to zero in an explicit initialization
  phase. The learner-facing explanation must state why these cells are zero.
- Evaluate remaining cells in row-major order. For an item that fits, compare the exclude value
  `dp[i - 1][w]` with the include value `value[i] + dp[i - 1][w - weight[i]]`. For an item that
  does not fit, explain that only exclusion is possible.
- On equal include and exclude values, choose exclusion. This applies both to cell-decision state
  and to reconstruction, yielding a deterministic selected-item list.
- After tabulation, reconstruct from `dp[itemCount][capacity]`. Move to the prior row without
  selecting an item when exclusion was chosen; otherwise select the current item and reduce the
  capacity by its weight. Finish with an explicit completed state.

### API family and canonical trace

- Extend the existing v2 API additively with `DYNAMIC_PROGRAMMING` discriminators for catalog
  entries, requests, results, visible states, event data, and constraints. Do not broaden existing
  families with optional dynamic-programming fields or add a new API version.
- Register one catalog algorithm for 0/1 Knapsack and describe its item and capacity bounds in
  catalog constraints. Continue using the established catalog-discovery and trace-creation routes.
- The backend is the sole owner of validation, recurrence execution, event ordering, table values,
  selected branches, and reconstruction. The frontend renders the supplied trace and never
  recomputes Knapsack decisions.
- Each event has a contiguous one-based sequence, a pseudocode-line identifier, typed semantic
  data, and a complete immutable dynamic-programming state snapshot.
- A visible state contains enough information to render the item definitions, dimensions and
  current values of the table, the active cell, base-case or tabulation or reconstruction phase,
  applicable include/exclude candidates, the selected branch, and the partial reconstructed
  selection.
- Emit semantic events for table initialization, candidate evaluation, cell commitment,
  reconstruction movement or item selection, and completion. Each non-base cell has separate
  evaluate and commit events; do not expose incidental loop bookkeeping as learner-facing steps.
- The final result reports maximum value, total selected weight, selected item identities in
  reconstruction order suitable for presentation, and the final capacity context. An empty
  selection is valid.
- Requests reject malformed item records, absent or invalid names, weights below one, negative
  values, negative capacity, and dimensions outside the stated bounds with the established
  structured validation response. A trace that exceeds the global event limit uses the established
  trace-limit response.

### Frontend learning experience

- Add a dedicated dynamic-programming capability/adapter and workbench input experience. Preserve
  the existing family-specific adapter model instead of accumulating family-specific branches in
  the main workbench.
- Provide editable item rows and capacity, a concise default, and curated presets. Preserve valid
  authored draft content while validation feedback is shown.
- Keep the dynamic-programming draft independent from sorting, search, graph traversal,
  pathfinding, and tree drafts. Editing after a completed run marks only this draft changed;
  completed playback remains available until the learner explicitly starts a replacement run.
- Render the complete table, current cell, dependency cells, candidates, selected branch,
  phase-specific explanation, pseudocode, and final result. Use labels, outlines, and text in
  addition to color for status distinctions.
- Reuse the established playback, cancellation, stale-response protection, and selected-algorithm
  URL behavior. Do not put full item drafts or trace state in the URL.
- Pair the graphical table with an accessible native or equivalent table/text representation that
  exposes headers, values, active subproblem, and final selection. Announce meaningful table
  commits, reconstruction selections, and completion without narrating decorative changes.
- Respect the existing reduced-motion preference by making updates and highlights non-animated or
  minimally animated as appropriate.

## Testing Decisions

Tests assert externally observable contracts and learner-visible behavior, not private recurrence
implementation details. Use the two confirmed existing seams, with focused algorithm tests only
where they protect behavior that is otherwise difficult to express at the contract boundary.

1. **Backend v2 trace-contract seam.** Test catalog discovery, family discrimination, validation,
   serialized results, canonical immutable snapshots, event sequences, pseudocode alignment,
   trace limits, and unchanged existing-family contracts through the API boundary. Use existing
   v2 regression-fixture and controller/contract-test patterns as prior art.
2. **Frontend dynamic-programming workbench seam.** Test authored drafts, preset loading,
   validation feedback, independent draft retention, request lifecycle, playback, explanation,
   final selection presentation, accessible table/text content, keyboard operation, non-color
   cues, and reduced motion through the user-facing workbench boundary. Use existing API wrapper,
   adapter, playback-control, graph, and tree UI tests as prior art.
3. **Focused Knapsack behavior.** Test observable trace behavior for the recurrence, base cases,
   ineligible items, deterministic equal-value ties, reconstruction, and immutable snapshots.
   Avoid asserting loop variables, storage layout, or other private implementation mechanisms.

Cover at least these cases:

- A single item that fits, one that does not fit, capacity zero, and an optimal empty selection.
- A mixed item set that demonstrates both inclusion and exclusion in different cells.
- Equal-value alternatives proving exclusion wins ties in both committed cells and the final
  reconstructed selection.
- Multiple selected items, selected weight exactly at capacity, and unused remaining capacity.
- Minimum and maximum supported item counts and capacities, plus all malformed or out-of-bound
  item and capacity inputs.
- Base-case initialization, row-major table progression, evaluate-before-commit ordering,
  contiguous sequences, final completion, complete snapshots, and accurate summary metrics.
- Catalog constraints, incorrect family requests, unknown algorithms, structured validation,
  trace-limit behavior, and regression coverage for sorting, search, graph traversal, pathfinding,
  and trees.
- Family switching, draft preservation, trace replacement only on explicit run, cancellation,
  stale responses, timeline controls, accessibility semantics, live announcements, keyboard use,
  non-color distinctions, and reduced motion.

After each vertical slice, run the focused backend and frontend tests. Before milestone completion,
run the full backend suite and package build, plus frontend tests, lint, and production build.

## Out of Scope

- Top-down memoization, recursion visualization, or a comparison between memoization and
  tabulation.
- Additional dynamic-programming problems, including Fibonacci, Coin Change, Longest Common
  Subsequence, edit distance, or unbounded Knapsack.
- Learner-prediction quizzes, manual table editing, or answer grading.
- Fractional Knapsack, repeated-item selection, negative weights, negative values, or zero-weight
  items.
- Large or virtualized tables beyond 10 items and capacity 20.
- Saving, sharing, importing, exporting, or comparing multiple authored runs.
- Frontend reimplementation of recurrence or reconstruction logic.

## Further Notes

- This milestone follows the workbench’s state-by-state learning model and the established
  backend-owned trace architecture.
- The existing ADR that placed trees ahead of dynamic programming is historical sequencing, not a
  conflict: the tree milestone now exists and this specification defines the next proposed family.
- The domain glossary has no dynamic-programming-specific terms yet. This specification therefore
  uses the established terms `algorithm visualization workbench`, `trace`, and `family`, and keeps
  Knapsack terminology narrowly scoped until a domain-modeling decision is needed.

