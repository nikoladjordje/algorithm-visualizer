# Product Requirements: Search Visualization

## Problem Statement

The workbench teaches sorting and graph algorithms but cannot yet show how an algorithm locates a
value in a sequence. Learners therefore have no way to contrast a linear inspection of arbitrary
data with binary search's repeated elimination of a sorted interval. Reusing the sorting contract
would obscure this distinction: searching preserves the authored sequence, needs a target, and
ends in either a found or a valid not-found result.

The next milestone must add linear and binary search as complete learning experiences without
changing sorting or graph behavior. Each algorithm must produce a deterministic typed backend trace
that the frontend can replay without reimplementing its decision logic.

## Solution

Introduce `SEARCH` as a family in the v2 catalog and trace API. Linear search and binary search
accept an editable integer sequence and target. They share one retained search draft, but execute
individually; changing an algorithm clears the old trace without running the new one.

Linear search inspects values from left to right and returns the first equality it encounters.
Binary search requires a non-decreasing sequence and returns the first equality it probes while
halving an inclusive search interval. An absent target is a successful completed result, not a
validation or request error. The workbench renders an indexed horizontal cell row and exposes
selection, comparison, interval narrowing, completion, pseudocode, metrics, explanations, and
accessible textual equivalents as distinct learning steps.

## User Stories

1. As a learner, I want to choose linear or binary search, so that I can study two canonical ways
   to locate the same target value.
2. As a learner, I want one editable integer sequence and target shared by both algorithms, so that
   I can run comparable experiments without rebuilding the input.
3. As a learner, I want search drafts kept separate from sorting and graph drafts, so that changing
   families does not replace one kind of experiment with another.
4. As a learner, I want my selected algorithm represented in the URL, so that I can reload or share
   the selected workbench mode without exposing my authored input.
5. As a learner, I want switching algorithms to clear an old trace but not execute automatically,
   so that output is never attributed to the wrong algorithm.
6. As a learner, I want to search an empty sequence, so that I can see a valid no-work not-found
   outcome.
7. As a learner, I want linear search to inspect indices from left to right, so that its first match
   is unambiguous.
8. As a learner, I want binary search to accept equal adjacent values in an ascending sequence, so
   that duplicates are a normal case rather than invalid input.
9. As a learner, I want binary search to reject an unsorted sequence with clear feedback, so that a
   hidden sort does not conceal its precondition.
10. As a learner, I want binary search to return the first equal value it probes, so that the trace
    teaches ordinary binary search rather than a leftmost-occurrence variant.
11. As a learner, I want selection, comparison, and interval narrowing shown as separate steps, so
    that I understand both what value was considered and why the remaining interval changed.
12. As a learner, I want indices displayed with values, so that I can connect each inspection and
    result to its position in the sequence.
13. As a learner, I want the currently inspected cell and the active binary-search interval shown
    without relying on color, so that the visual state remains interpretable for everyone.
14. As a learner, I want a found result to identify its index and a not-found result to complete
    normally, so that outcomes are precise and comparable.
15. As a learner, I want comparison counts and complexity material for both algorithms, so that I
    can connect observed work to their asymptotic behavior.
16. As a learner, I want algorithm-specific presets, so that I can quickly explore early matches,
    late matches, duplicates, not-found results, and binary interval changes.
17. As a keyboard user, I want the sequence, target, presets, selector, timeline, and playback
    controls operable without a pointer.
18. As a screen-reader user, I want the active index, compared value, target relation, remaining
    interval, and completion outcome available in text and announcements.
19. As a motion-sensitive user, I want reduced-motion preferences respected by search playback.
20. As a user issuing requests quickly, I want stale search requests cancelled and ignored, so that
    an earlier trace cannot replace my current experiment.
21. As a developer, I want `SEARCH` traces, states, and event payloads discriminated and typed, so
    that search-specific fields are not hidden in sorting or nullable universal contracts.
22. As a developer, I want deterministic events, snapshots, and results, so that traces can be
    replayed, tested, and locked as fixtures.

## Implementation Decisions

### Delivery scope and sequence

- Deliver linear search and binary search in one milestone.
- Complete vertical slices in this order: shared `SEARCH` contract and input groundwork, linear
  search, then binary search, followed by shared presets, accessibility review, fixtures, and
  documentation.
- Retain the existing v2 catalog and `POST /api/v2/algorithms/{algorithmId}/trace` route.
- Keep the existing 10,000-event trace limit. Searching at the stated input limit should remain far
  below it; preserve the existing limit failure behavior rather than creating a family exception.
- Do not automatically execute after an algorithm, sequence, or target change.

### API family and contracts

- Add `SEARCH` as a family-discriminated v2 catalog and request kind.
- Register catalog entries in this order: `linear-search`, then `binary-search`, after the existing
  sorting entries and before graph families.
- Add family-specific constraints: minimum values `0`, maximum values `50`, signed 32-bit integer
  values and target, and a binary-search `requiresNonDecreasingValues` capability.
- A search request contains `kind: "SEARCH"`, immutable `values`, and integer `target`.
- A search trace contains the API version, `SEARCH` algorithm metadata, immutable search input,
  typed search result, limits, and ordered events. It does not contain sorting item identities,
  sorted ranges, graph nodes, or graph state.
- A request kind that does not match the selected algorithm returns the existing family-mismatch
  Problem Details response.
- Existing sorting, graph-traversal, and pathfinding requests and responses remain unchanged.

### Shared search semantics and result

- Preserve authored sequence order. Neither search algorithm sorts, copies into a reordered visible
  sequence, or otherwise mutates values.
- Allow an empty sequence and report it as a completed not-found result with zero comparisons.
- A result contains `found`, `foundIndex` when found, and `comparisons`.
- Do not duplicate transient current index or binary bounds in the result; the final immutable event
  snapshot retains those teaching details.
- A match means equality with the integer target. Duplicate values are permitted.
- Both algorithms stop at their first equality according to their own deterministic inspection
  order; they do not continue to find all matches or a leftmost occurrence.
- Every event has a contiguous one-based sequence, a pseudocode-line identifier, a complete typed
  visible-state snapshot, and typed event data.
- Use semantic events only. Do not expose loop checks, local-variable reads, or frontend-derived
  state as fake algorithm operations.

### Linear search

- Inspect indices in increasing order from zero through the final index.
- Emit distinct initialization, candidate-selection, target-comparison, found, and not-found
  completion semantics. Candidate selection and comparison remain separate playback steps.
- Stop immediately when the selected candidate equals the target. This is the first match in
  left-to-right sequence order.
- For a miss, inspect every index before emitting a completed not-found result.
- State exposes the complete immutable values, target, selected index when one exists, inspected
  indices or equivalent completed-prefix state, and no binary interval.
- Report comparison count, inspected index, and found status through events and the final result.

### Binary search

- Require input values to be non-decreasing: each value must be greater than or equal to its
  predecessor. Equal values remain valid.
- Reject an unsorted sequence before execution with a validation message stating that binary search
  requires ascending order. Do not silently sort, mutate, or substitute a copy of the input.
- Start with inclusive bounds `low = 0` and `high = values.length - 1`; an empty sequence therefore
  starts with an empty interval and completes not found without an inspected candidate.
- When the interval is non-empty, calculate `middle` safely from the bounds, select that index, and
  compare its value with the target in separate semantic steps.
- On equality, complete immediately. The result is the first equality probed, not necessarily the
  leftmost equal value.
- When the selected value is less than the target, narrow to the inclusive right interval. When it
  is greater, narrow to the inclusive left interval. Emit the range-narrowing operation as its own
  event after the comparison.
- Complete not found once `low > high` and expose the empty final interval in the final state.
- State exposes immutable values, target, inclusive `low` and `high` bounds, selected middle index
  when one exists, and the relation from the most recent comparison.

### Frontend learning experience

- Extend the capability registry with a `SEARCH` adapter boundary. Search adapters own pseudocode,
  explanations, complexity content, presets, event annotation extraction, and relevant counters;
  the main workbench retains generic request and playback ownership.
- Use one search draft consisting of the sequence text and target text. Retain it while switching
  between linear and binary search; keep it separate from sorting and graph drafts.
- Show a sequence input and target input for the search family. Parse both as signed 32-bit integer
  values; show local validation feedback before issuing a request when parsing fails.
- Use a horizontal row of indexed cells rather than magnitude-oriented bars. Render value, index,
  active candidate, found cell, inspected status, and active binary interval through labels,
  patterns, borders, and accessible text as well as color.
- Show the active interval as an explicit inclusive range such as `[2, 6]`; distinguish an empty
  interval from an unavailable or omitted interval.
- Render selection, comparison, and range narrowing as separate timeline steps. Do not infer the
  next range in the frontend.
- Display a concise completion panel: found value and index when found; otherwise an explicit
  “not found” outcome. Display comparison count for both algorithms.
- Provide presets covering an immediate hit, a late linear hit, a miss, duplicate values, a binary
  search that repeatedly narrows left and right, and an empty sequence.
- Keep selection in the existing `algorithm` URL query parameter. Do not place values or target in
  the URL.
- Retain existing cancellation, request identifier, retry, live-region, keyboard, focus, timeline,
  speed, and reduced-motion behavior.

## Testing Decisions

Tests assert observable behavior, serialized contracts, and learner-facing state rather than
private implementation details. Preserve the project’s three established seams:

1. **Backend HTTP boundary.** Verify catalog discovery, `SEARCH` family discrimination, request
   validation, constraints, serialization, errors, trace limits, and additive compatibility for
   existing families.
2. **Frontend workbench boundary.** Verify selection, URL state, retained search drafts, separation
   from sorting and graph drafts, cleared playback, inputs, validation, request races, indexed-cell
   state, explanations, pseudocode, metrics, completion language, and accessibility.
3. **Focused algorithm boundary.** Verify correctness, complete immutable snapshots, contiguous
   event sequences, deterministic inspection order, comparison counts, pseudocode mappings, and
   event semantics for each algorithm.

Test at least these scenarios:

- Empty and one-item sequences, including found and not-found targets.
- Negative values, signed 32-bit minimum and maximum values, and duplicate values.
- Linear hits at the first, middle, and last index, plus a miss that visits every index.
- Binary hits after left and right interval narrowing, a miss, and an interval that becomes empty.
- A non-decreasing binary input with duplicates, verifying that the first equality probed is
  returned rather than a leftmost occurrence.
- Every adjacent inversion category for binary validation, proving that unsorted input is rejected
  and never silently reordered.
- Maximum-size input and trace-limit behavior.
- Switching linear and binary search while retaining sequence and target but clearing playback.
- Switching from search to sorting or graph work and back, proving draft isolation.
- Keyboard operation, textual equivalents, live announcements, non-color cues, and reduced motion.
- Representative contract fixtures for each search trace shape, including empty, found, and
  not-found outcomes.

After each vertical slice, run focused backend and frontend tests. Before completing the milestone,
run the full backend suite and package build plus the frontend test, lint, and production build
commands.

## Out of Scope

- Side-by-side or synchronized execution of multiple algorithms.
- Recursive binary search or call-stack visualization.
- Descending-order binary search.
- Leftmost/rightmost occurrence, lower-bound, upper-bound, insertion-point, or all-match search
  variants.
- Interpolation, exponential, jump, ternary, hashing, trie, substring, or arbitrary-string search.
- Silently sorting an input or mutating it before binary search.
- Searching collections larger than 50 values or traces larger than 10,000 events.
- Persistence, accounts, server-saved sequences, or shareable values and targets in the URL.
- Changes to sorting, graph-traversal, or pathfinding semantics.

## Further Notes

Suggested issue breakdown:

1. Add the `SEARCH` catalog family, typed contracts, request validation, and frontend capability
   boundary while preserving all existing families.
2. Implement and test the linear-search trace, adapter, indexed-cell renderer, and learning
   material.
3. Implement binary sortedness validation and the binary-search trace, adapter, interval renderer,
   and learning material.
4. Add presets, accessibility coverage, API documentation, user-guide material, and representative
   regression fixtures.
5. Run the complete regression suite and manually review both algorithms with empty, duplicate,
   negative, found, and not-found inputs.
