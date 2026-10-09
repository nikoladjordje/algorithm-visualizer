# 03: Teach Linked List append traversal

**What to build:** A learner can append a labelled node and observe a basic singly linked list walk from `head` through each `next` link before connecting the final node to the new node. Appending to an empty list visibly establishes `head` without a traversal, and the lesson explains the observed linear traversal cost.

**Blocked by:** 02 — Add the Linked List prepend learning path.

**Status:** completed

- [x] `append("label")` is available in both Linked List authoring surfaces with synchronized valid text, typed submission, and line-specific invalid-command feedback.
- [x] Canonical append traces show new-node allocation, every required node inspection in order, final-link creation, and the empty-list variant with immutable snapshots and typed semantic events.
- [x] The topology visualizer, explanation, pseudocode, live narration, and concise complexity guidance make traversal and final linking understandable without client-side list semantics.
- [x] Contract, algorithm, component, and workbench tests verify append ordering, duplicate identity, empty/non-empty cases, event ordering, and playback.

## Implementation

Added `append("label")` to the Linked List contract, authoring capability, and canonical trace. Non-empty append now allocates a node, inspects each node from `head` through the final node, then creates the final `next` link; empty append establishes `head` directly. The workbench renders and announces the inspected node and explains append's linear traversal cost.
