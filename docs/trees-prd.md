# Product Requirements: Binary Search Trees

## Problem Statement

The workbench teaches sorting, sequence searching, graph traversal, and pathfinding, but it does
not yet show how an ordered hierarchical structure is formed or used. Learners cannot see how an
integer's insertion order determines binary-search-tree shape, how comparisons choose a lookup
branch, or why preorder, inorder, and postorder visit the same tree differently.

The next milestone must add one complete binary-search-tree learning experience without treating a
tree as a graph with nullable fields, duplicating algorithm execution in the frontend, or making
balancing and deletion obscure the fundamental ordering invariant.

## Solution

Add an unbalanced binary search tree (BST) as a new `TREE` API family. A learner authors an ordered
sequence of unique signed 32-bit integers and chooses one operation: lookup, preorder, inorder, or
postorder traversal. The backend produces a canonical trace that first constructs the tree from
that insertion sequence and then performs the chosen operation.

The frontend plays the trace in a deterministic rooted SVG tree. It exposes node visits,
comparisons, child attachments, traversal order, pseudocode, explanations, and results with the
existing playback controls. A lookup miss is a valid completed operation, not invalid input.

## User Stories

1. As a learner, I want to author an ordered insertion sequence, so that I can see how insertion
   order determines BST shape.
2. As a learner, I want duplicate values rejected before execution, so that the tree keeps one
   strict ordering invariant.
3. As a learner, I want smaller values placed left and larger values placed right, so that every
   branch choice is predictable.
4. As a learner, I want construction replayed before my selected operation, so that the resulting
   shape is explained rather than assumed.
5. As a learner, I want to see each meaningful insertion visit, comparison, and child attachment,
   so that I understand how each value finds its position.
6. As a learner, I want to choose a lookup operation and target value, so that I can follow the
   comparison path to a found value or a valid miss.
7. As a learner, I want a missing lookup to complete normally, so that absence is explained by the
   reached missing child rather than presented as an error.
8. As a learner, I want to choose preorder, inorder, or postorder traversal, so that I can compare
   their different visit orders on the same constructed tree.
9. As a learner, I want each traversal visit shown one node at a time, so that the order is
   inspectable through playback.
10. As a learner, I want a fixed rooted tree drawing with labeled nodes and parent-child edges, so
    that the hierarchy remains legible and reproducible.
11. As a learner, I want the active node, visited nodes, comparison direction, attachment, and
    completed result distinguished without relying on color alone.
12. As a keyboard user, I want to author the sequence, choose the operation and target, and use
    playback without a pointer.
13. As a screen-reader user, I want an equivalent textual tree description and meaningful live
    announcements, so that the SVG is not the only way to understand execution.
14. As a motion-sensitive user, I want the existing reduced-motion behavior to apply to tree
    playback.
15. As a learner switching families, I want the tree draft retained separately while the prior
    trace is cleared, so that experiments are not lost or misattributed.
16. As a developer, I want `TREE` input, result, state, event, and constraint types discriminated
    from existing families, so that tree semantics do not become optional graph fields.
17. As a developer, I want the backend trace to be canonical and immutable, so that replay,
    testing, and visual presentation do not reimplement BST behavior.
18. As a developer, I want deterministic sequences and complete summary metrics, so that traces
    can be tested and compared reliably.

## Implementation Decisions

### Delivery scope and sequence

- Deliver one unbalanced BST vertical slice: construction, lookup, preorder traversal, inorder
  traversal, postorder traversal, typed contracts, deterministic visualization, learning content,
  accessibility, and focused tests.
- Implement the vertical slices in this order: shared `TREE` contract and catalog groundwork; BST
  construction; lookup; traversals; then frontend visualization and regression verification.
- Accept an insertion sequence of 1–31 unique signed 32-bit integers. Preserve source order.
- Reject duplicate values. Do not choose a duplicate side, store a frequency, or silently discard
  a value.
- Every value smaller than a node belongs in its left subtree and every larger value in its right
  subtree.
- Retain the existing maximum of 10,000 trace events. A tree trace that would exceed it fails with
  the established trace-limit Problem Details response.
- Keep the tree draft independent from sorting, search, graph-traversal, and pathfinding drafts.
  Changing an algorithm clears playback and cancels in-flight work but does not execute
  automatically.

### API family and catalog

- Extend API v2 additively. Do not introduce v3 or alter existing family wire shapes.
- Add `TREE` to the catalog family, request-input, result, visible-state, typed-event, and
  constraint discriminators.
- Register one catalog entry, `binary-search-tree`, after `dijkstra`. Its display name is
  `Binary Search Tree`; it advertises `TREE`, contract version `2.0`, minimum and maximum values,
  signed-32-bit value bounds, unique values, and the four supported operations.
- Continue using `GET /api/v2/algorithms` and
  `POST /api/v2/algorithms/{algorithmId}/trace` as the only catalog and execution routes.
- A request must use `kind: "TREE"` for `binary-search-tree`; other kinds continue to receive the
  existing structured family-mismatch Problem Details response.
- Use a discriminated operation in the request:

  ```json
  { "kind": "TREE", "insertionValues": [8, 3, 10, 1, 6],
    "operation": { "kind": "LOOKUP", "target": 6 } }
  ```

  Traversals use `{ "kind": "PREORDER" }`, `{ "kind": "INORDER" }`, or
  `{ "kind": "POSTORDER" }` and have no target field.
- Reject empty or oversized sequences, non-integers, values outside signed-32-bit range,
  duplicates, an unknown operation, a traversal carrying a lookup target, and a lookup without a
  target with structured validation feedback.

### Canonical tree trace

- Use one immutable trace snapshot shape for the `TREE` family. It contains the constructed nodes
  identified by stable insertion IDs, each node's value and parent/left/right relationships, the
  root ID, active node ID when applicable, selected lookup target when applicable, completed
  traversal order, and the most recent comparison or attachment when applicable.
- Do not infer the tree in the frontend from the insertion sequence. The trace state is the source
  of truth for structure and learner-visible progress.
- Construction begins from an empty tree. For every input value, emit a visible node visit and
  comparison at each existing node on its insertion path, followed by one attachment event that
  identifies the root, left-child, or right-child position. Root attachment requires no fictitious
  comparison.
- Lookup emits each selected node visit and comparison decision. A successful lookup emits a
  found event; a path that reaches an absent child emits an unsuccessful-lookup event. Both end in
  a completion event.
- Each traversal emits a node-visit event in its defined order and then a completion event. The
  traversal order in state and result grows only as nodes are visited.
- Use typed semantic events such as `TREE_INITIALIZED`, `INSERTION_NODE_VISITED`,
  `INSERTION_COMPARED`, `NODE_ATTACHED`, `CONSTRUCTION_COMPLETED`, `LOOKUP_NODE_VISITED`,
  `LOOKUP_COMPARED`, `LOOKUP_FOUND`, `LOOKUP_NOT_FOUND`, `TRAVERSAL_NODE_VISITED`, and
  `OPERATION_COMPLETED`. Exact names may be adjusted only to match existing v2 naming conventions;
  their distinct meanings and payloads must remain typed.
- Every event has a contiguous one-based sequence, pseudocode-line ID, immutable complete state,
  and discriminated event data. Do not expose recursion bookkeeping, null-child probes unrelated to
  a lookup miss, or incidental collection operations as playback steps.
- The lookup result reports `found`, target, visited values in inspection order, and comparison
  count. A successful lookup also reports the matched node; an unsuccessful lookup does not
  fabricate one.
- A traversal result reports its selected order, ordered visited values, visited-node count, and
  construction comparison and attachment counts. The trace summary reports the operation-specific
  comparison and visit counts as applicable.

### BST behavior

- Build the tree by inserting the authored values strictly in sequence order.
- A lookup starts at the root and compares target with current value. It moves left for a smaller
  target, right for a larger target, succeeds on equality, and completes unsuccessfully when the
  selected child is absent.
- Preorder visits node, left subtree, then right subtree. Inorder visits left subtree, node, then
  right subtree. Postorder visits left subtree, right subtree, then node.
- Traversal implementation may be recursive or iterative, but public event order and snapshots
  must follow the stated semantic order. The UI must not portray implementation call frames.
- Inorder traversal of a valid constructed tree must be strictly ascending. This is an invariant to
  test and explain, not a separate sorting operation.

### Frontend learning experience

- Add a tree-family adapter and a dedicated tree workbench input panel. Do not grow the main
  workbench into family-specific conditional branches.
- Provide an integer-sequence text input, an operation selector with Lookup, Preorder, Inorder,
  and Postorder, and a target input visible and required only for Lookup.
- Use clear validation feedback for commas/whitespace, integer range, duplicate values, sequence
  length, and required lookup target. Keep valid authored text available for correction.
- Continue storing the selected catalog algorithm in `?algorithm=` without encoding tree draft
  contents or target in the URL. Keep insertion sort as the default when no valid algorithm query
  is present.
- Continue using shared play, pause, next, previous, reset, speed, timeline, cancellation,
  stale-response protection, and request-state behavior.
- Render a deterministic rooted SVG layout derived only from the complete tree state. Node circles
  show integer labels; parent-child edges show the hierarchy. The layout may scale its viewBox for
  depth and width, but introduces no graph editor, zoom, pan, drag, or manual rearrangement.
- Use non-color cues for active, visited, attached, and completed states, such as labels, outline
  patterns, and textual status. Visually identify the current comparison direction and latest
  attachment.
- Display the selected operation's pseudocode and an event-specific plain-language explanation.
  Display the insertion sequence, current tree description, lookup path or traversal order, and
  final found/not-found or traversal result.
- Give the SVG an accessible name and pair it with a programmatic textual tree representation that
  states the root and every node's left/right child relationship. Announce meaningful attachments,
  comparisons, node visits, lookup outcome, and completion without narrating decoration.

## Testing Decisions

Tests assert observable behavior, serialized contracts, deterministic learning state, and
accessible UI behavior rather than private node implementation details. Preserve the established
three seams:

1. **Backend HTTP boundary.** Verify catalog discovery, `TREE` family discrimination, request
   validation, trace serialization, errors, limits, and unchanged existing-family contracts.
2. **Frontend workbench boundary.** Verify selection, retained independent drafts, cleared traces,
   input validation, conditional lookup target, request cancellation, playback, explanations,
   textual equivalents, and accessibility.
3. **Focused BST boundary.** Verify construction shape, strict invariant, event ordering, immutable
   snapshots, lookup paths, unsuccessful lookup, traversal orders, results, summary counts, and
   contiguous sequences.

Test at least these scenarios:

- One-value tree for every operation, including a found and absent lookup.
- Balanced, left-skewed, and right-skewed insertion sequences.
- A mixed-shape tree that proves each preorder, inorder, and postorder result.
- A lookup found at the root, leaf, and internal node, plus misses that terminate left and right.
- Negative values and signed-32-bit minimum and maximum values.
- Duplicate values at different input positions, every malformed sequence category, and a missing
  or invalid lookup target.
- Minimum and maximum sequence sizes, maximum-depth skew, and trace-limit behavior.
- Strictly ascending inorder output for randomized unique insertion sequences.
- Accurate parent/child relationships, active node, comparison direction, attachments, immutable
  snapshots, operation completion, and result metrics.
- Tree-family mismatch, unknown algorithm, unsupported operation, catalog constraint serialization,
  and no regression in sorting, search, graph traversal, or pathfinding contracts.
- Switching between tree operations and other families while preserving respective drafts and
  clearing prior playback; URL selection without draft serialization; cancellation and stale
  response protection.
- Keyboard operation, accessible names and textual tree state, live announcements, non-color
  distinctions, and reduced motion.

After each vertical slice, run its focused backend and frontend tests. Before completion, run the
complete backend suite and package build plus frontend tests, lint, and production build.

## Out of Scope

- Deletion, replacement, rotations, AVL trees, red-black trees, heaps, treaps, or any other
  balancing behavior.
- Duplicate-value policies such as multiplicity counts or consistent-side insertion.
- General trees, n-ary trees, tries, B-trees, and tree serialization formats.
- Direct visual tree editing, dragging, zooming, panning, persistence, sharing authored inputs, or
  comparison of multiple tree runs.
- Tree pathfinding, lowest-common-ancestor operations, range queries, or subtree metrics.
- Exposing recursion stacks or implementation bookkeeping as learner-facing playback.
