# 05: Teach Linked List head removal

**What to build:** A learner can remove the first node and observe the current head, movement of `head` to its successor, detachment of the former head with its `next` link cleared, and its removal from live topology. Removing from an empty list remains a visible empty-structure outcome that lets later operations execute.

**Blocked by:** 02 — Add the Linked List prepend learning path.

**Status:** completed

- [x] `removeFirst()` is authorable from both Linked List editor surfaces and uses the dedicated typed operation contract.
- [x] A non-empty removal trace shows the affected head, successor selection, head movement, detached-node state, and resulting active topology through immutable semantic snapshots.
- [x] An empty removal produces a learner-visible empty-structure outcome, leaves topology unchanged, and does not prevent subsequent operations in the sequence.
- [x] Algorithm, API-contract, visualizer, and workbench tests prove non-empty and empty removal, duplicate identity, event ordering, explanations, and backward/forward playback.

## Implementation

Added typed `REMOVE_FIRST` authoring and validation, including the `removeFirst()` command. A non-empty trace now emits current-head selection, head movement, detachment with a cleared `next` link, and removal from live topology. Empty removal emits a visible no-op outcome and allows later operations to run. The visualizer narrates the detached node accessibly.
