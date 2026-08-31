# Product Requirements: Multi-Algorithm Visualization

## Problem Statement

The workbench currently teaches only insertion sort. Learners cannot compare how other sorting strategies discover order, move values, divide ranges, or construct intermediate structures. The current trace contract also assumes a sorted prefix, which cannot accurately describe sorted suffixes, disjoint partitions, merge ranges, or heap boundaries.

The product needs five additional algorithms without turning playback, visualization, or API code into algorithm-specific conditionals. Each algorithm must remain pedagogically accurate, deterministic, accessible, and independently deliverable.

## Solution

Add selection sort, bubble sort, merge sort, quick sort, and heap sort incrementally. A backend catalog will advertise executable algorithms and their operational capabilities. Users will select one algorithm, retain the same integer input when switching, and generate a new trace through a uniform endpoint.

All traces will retain one versioned envelope and shared event metadata. Each algorithm will define a typed event union composed from shared primitive events and its own instructional events. The frontend will use an adapter registry to translate each supported contract into pseudocode highlighting, explanations, bar annotations, sorted ranges, and relevant counters.

## User Stories

1. As a learner, I want to choose among implemented sorting algorithms, so that I can study different approaches to ordering the same data.
2. As a learner, I want insertion sort selected initially, so that the existing experience remains familiar.
3. As a learner, I want my selected algorithm represented in the URL, so that I can reload or share the same workbench choice.
4. As a learner, I want my integer input preserved when I switch algorithms, so that I can reuse the same example.
5. As a learner, I want an old trace cleared when I switch algorithms, so that results are never attributed to the wrong algorithm.
6. As a learner, I want execution to begin only when I request visualization, so that changing the selector does not unexpectedly start work.
7. As a learner, I want the selector to contain only executable algorithms, so that every offered choice works.
8. As a learner, I want a clear unavailable state when the catalog cannot load, so that missing capabilities are not disguised by stale frontend data.
9. As a learner, I want each event explained in plain language, so that I understand why the algorithm performed it.
10. As a learner, I want the corresponding pseudocode line highlighted, so that I can connect execution to the algorithm description.
11. As a learner, I want comparisons, reads, writes, and swaps counted when relevant, so that the displayed work reflects the algorithm's behavior.
12. As a learner, I want sorted regions shown accurately, so that prefixes, suffixes, partitions, and merged ranges are not conflated.
13. As a learner, I want equal values to retain visible identity, so that I can observe whether an algorithm is stable.
14. As a learner, I want selection sort to show how its current minimum changes, so that the final swap is understandable.
15. As a learner, I want selection sort to avoid a fictitious swap when the minimum is already positioned, so that its trace represents actual work.
16. As a learner, I want bubble sort to mark its growing sorted suffix, so that each pass has a visible result.
17. As a learner, I want bubble sort to explain early termination after a pass with no swaps, so that I understand its optimization.
18. As a learner, I want merge sort to display active ranges and its auxiliary buffer, so that temporary copies do not look like duplicated or missing values.
19. As a learner, I want merge sort to choose the left item first when values are equal, so that its stability is demonstrable.
20. As a learner, I want quick sort to distinguish its pivot, scanner, partition boundary, and active range, so that partitioning is understandable.
21. As a learner, I want quick sort to explain the limitations of a last-element pivot, so that deterministic visualization is not mistaken for an optimal strategy.
22. As a learner, I want heap sort to identify parent-child relationships, so that array-based heap operations are understandable without a full tree view.
23. As a keyboard user, I want the selector and all playback controls operable without a pointer, so that every algorithm remains accessible.
24. As a screen-reader user, I want algorithm changes and meaningful execution steps announced, so that the visualization does not rely on color.
25. As a motion-sensitive user, I want reduced-motion preferences respected across all algorithms, so that playback remains comfortable.
26. As a user issuing requests quickly, I want stale requests cancelled and ignored, so that an older response cannot replace my current selection.
27. As a frontend user with a newer backend, I want unsupported catalog entries withheld with a compatibility notice, so that I cannot select a contract the UI cannot render.
28. As a developer, I want every algorithm to use the shared executor and trace abstractions, so that additions remain type-safe and discoverable.
29. As a developer, I want algorithm-specific event contracts, so that instructional meaning is preserved without untyped payload maps.
30. As a developer, I want deterministic sequences and complete summary counts, so that traces can be tested and replayed reliably.

## Implementation Decisions

### Delivery sequence

Implement in this order: selection sort, bubble sort, merge sort, quick sort, then heap sort. Complete the backend execution, API integration, frontend adapter, learning content, visualization behavior, and focused tests for one algorithm before starting the next.

Before those increments, refactor the shared contract, executor registry, catalog, generic execution endpoint, item identity, sorted ranges, and frontend adapter boundary. This foundation is complete when insertion sort works exclusively through the new generic path and retains its current user-visible behavior.

### API and catalog

- Retain API major version v1. The application is pre-release, so the v1 contract may be changed now without retaining `sortedThrough`.
- Provide `GET /api/v1/algorithms`. Return only executable algorithms in this explicit order: insertion, selection, bubble, merge, quick, heap.
- Catalog entries own operational facts: stable ID, display name, availability, supported contract version, input constraints, and relevant metric types. Pedagogical prose remains frontend-owned.
- Provide `POST /api/v1/algorithms/{algorithmId}/trace` with the existing integer-list request shape.
- Unknown or unavailable IDs return structured Problem Details with code `ALGORITHM_NOT_FOUND`.
- Do not provide a hard-coded frontend catalog fallback. A catalog failure produces an unavailable state and retry action. A successful catalog may be retained for the current browser session.
- Every algorithm accepts 1–50 signed 32-bit integers. Every trace remains limited to 10,000 events and reports `TRACE_LIMIT_EXCEEDED` with HTTP 422 when exceeded.

### Trace and domain model

- Keep one trace envelope containing API version, algorithm metadata, integer input, summary, limits, and ordered events.
- Make the backend executor and trace types generic over algorithm event data. Contain heterogeneous executors inside a registry boundary; preserve concrete types elsewhere.
- Keep shared primitive events for semantically identical operations: reads, comparisons, swaps, writes, selection, and sorted marking where applicable.
- Give each algorithm a discriminated event union that composes shared primitives with algorithm-specific instructional events. Use typed records and discriminated TypeScript unions rather than arbitrary maps or `Object` payloads.
- Every event carries a 1-based contiguous sequence, pseudocode-line identifier, complete immutable visible-state snapshot, sorted ranges, and typed event data.
- Replace the single `sortedThrough` value with zero or more inclusive `sortedRanges`. This supports prefixes, suffixes, merged ranges, and disjoint finalized partitions.
- Assign every input item a stable identity while retaining its integer value. Requests and final `resultValues` stay integer-only. Events carry identities wherever movement or stability must be observable.
- Emit pedagogically meaningful visible-array operations. Exclude loop checks, local-variable access, and bookkeeping reads. Model merge-buffer movement with merge-specific semantics.
- Keep complete event counts in the trace summary. The catalog/adapter selects which comparison, read, write, or swap counters are emphasized for each algorithm.

### Algorithm contracts

- **Insertion sort:** migrate existing behavior to item identities, sorted ranges, the generic registry, and the adapter model.
- **Selection sort:** emit minimum selection, candidate reads/comparisons, minimum updates, placement swap/write when required, and sorted-prefix completion. Emit no swap when the minimum is already in place.
- **Bubble sort:** use the optimized form with early exit. Emit pass boundaries, adjacent operations, sorted-suffix updates, and an explicit no-swap completion explaining termination.
- **Merge sort:** use stable top-down recursion. Emit split-range, begin-merge, buffer movement, comparison/write, and complete-merge semantics. Take the left item first on equality. Render active left/right ranges and a compact auxiliary-buffer row.
- **Quick sort:** use Lomuto partitioning with a deterministic last-element pivot. Emit pivot selection, active partition, scanner and boundary movement, shared swap/write operations, partition completion, and finalized ranges. Explain the sorted/reverse-sorted worst case of this pivot choice.
- **Heap sort:** use bottom-up max-heap construction. Emit build-heap, root selection, heapify, shared comparison/swap/write operations, heap-boundary shrinkage, and sorted-suffix updates. Keep bars primary and add compact parent/child connectors or relationship labels rather than a separate tree visualization.

### Frontend behavior

- Build an algorithm adapter registry keyed by stable catalog ID. Each adapter owns pseudocode, complexity content, presets, event explanation, active-index/range extraction, relevant counters, and visualization annotations.
- Keep playback, timeline navigation, request states, and the base bar renderer generic.
- Default to insertion sort. Store selection in the `algorithm` URL query parameter. If the requested ID is absent, select the first catalog entry and announce the fallback accessibly.
- When selection changes, stop playback, clear trace and counters, preserve input, and wait for an explicit Visualize action.
- Cancel an in-flight trace request with `AbortController` and guard completion with a request identifier. Only the newest request may update state.
- Intersect catalog results with the frontend adapter registry. Hide unsupported entries and display a non-blocking compatibility notice.
- Continue supporting play, pause, next, previous, reset, speed selection, and timeline scrubbing for every algorithm.

## Testing Decisions

Tests assert observable behavior and contract invariants rather than private implementation details.

Use three seams:

1. The backend HTTP boundary verifies catalog discovery, generic trace execution, errors, serialization, constraints, and algorithm-specific contract discrimination.
2. The frontend workbench boundary verifies selection, URL state, preserved input, cleared playback, request races, explanations, counters, highlighting, catalog failures, compatibility notices, and accessibility.
3. Focused algorithm tests verify sorting correctness, deterministic events, stable item identity where promised, contiguous sequences, accurate snapshots/ranges, operation counts, trace limits, and pseudocode mappings.

After each algorithm increment, run only its focused backend and frontend tests. These tests must cover sorted, reverse-sorted, duplicate, negative, single-item, and maximum-size inputs. Add randomized correctness tests comparing results with the platform's ascending sort and deterministic invariant tests over the complete trace.

After all five increments, run the complete backend suite, frontend suite, lint, TypeScript build, and production build. Then manually review each algorithm for selector behavior, explanation clarity, keyboard playback, screen-reader announcements, contrast, reduced motion, duplicate identity, timeline navigation, and worst-case input behavior.

Follow existing test conventions: backend JUnit tests for algorithm behavior and Spring HTTP integration; frontend Vitest and Testing Library tests for user-visible behavior and accessibility.

## Out of Scope

- Side-by-side or competitive execution of multiple algorithms
- Automatic execution when the selector changes
- User-authored algorithms or arbitrary code execution
- Accounts, persistence, authentication, or a database
- Randomized or median-of-three quick-sort pivots
- Bottom-up merge sort or alternative partition schemes
- A standalone tree visualization for heap sort
- A server-managed content system for pseudocode, presets, explanations, or complexity prose
- Catalog entries for planned but unavailable algorithms
- Supporting inputs larger than 50 items or traces larger than 10,000 events

## Further Notes

The current implementation has a dedicated insertion-sort v1 endpoint, a non-generic trace model, a closed six-event frontend union, and a `sortedThrough` prefix marker. The implementation agent should treat the foundational migration as the first increment and keep insertion sort working throughout it.

The legacy unversioned insertion-sort endpoint currently exists as a compatibility adapter. Preserve it during this work unless a separate deprecation decision explicitly removes it. Its presence must not shape or weaken the new generic contract.

An algorithm is supported only when it sorts correctly and its complete learning experience works: typed events, summaries, pseudocode coverage, explanations, meaningful counters, visualization annotations, playback, accessibility, input constraints, and focused tests.
