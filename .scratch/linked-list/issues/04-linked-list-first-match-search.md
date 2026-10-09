# 04: Teach Linked List first-match search

**What to build:** A learner can find a labelled value by observing the list inspect nodes from `head` in order, stopping at the first matching live occurrence. When no node matches, the learner sees a distinct successful not-found outcome after the traversal reaches `null`.

**Blocked by:** 02 — Add the Linked List prepend learning path.

**Status:** completed

- [x] `find("label")` is authorable through synchronized structured and text surfaces and is submitted using the dedicated Linked List operation contract.
- [x] Trace states expose each inspected node and complete with either the first matching occurrence or a distinct not-found outcome after `null`, without mutating list topology.
- [x] Duplicate labels retain stable occurrence identity so the learner can tell which equal-labelled node was selected; learner-facing explanation, pseudocode, and narration use backend-owned events.
- [x] Backend, contract, visualizer, and workbench tests cover first-match behavior, duplicate labels, empty-list search, absent values, immutable topology, and accessible playback.

## Implementation

Added `find("label")` to the Linked List contract and both authoring surfaces. The backend emits
immutable inspection, first-match, and not-found snapshots without altering topology; the workbench
shows the matched occurrence with backend-derived explanation, pseudocode, narration, and complexity.
