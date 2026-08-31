# Product Requirements: Breadth-First Graph Traversal

## Status

Approved for specification and implementation.

This PRD records the decisions made during the BFS milestone design review. Where this document
conflicts with the earlier multi-algorithm visualization PRD, this document governs the graph
traversal milestone and the v2 API.

## Problem Statement

The workbench teaches only sorting algorithms. Learners cannot use the existing deterministic
playback experience to understand graph traversal, including how a queue changes, when nodes are
discovered, why edges are skipped, or how a breadth-first tree is formed.

The current v1 API is also shaped around sorting arrays. Extending that envelope in place would
either weaken its types or introduce a breaking change under the same major version. The product
needs a family-discriminated v2 contract that supports sorting and graph traversal without exposing
untyped event payloads or forcing controllers and clients to branch on implementation details.

## Product Goal

Ship one complete, deterministic breadth-first search vertical slice quickly while establishing a
reusable algorithm-family seam. A learner can enter an undirected graph, select a start node,
generate a traversal, and inspect every queue, node-state, examined-edge, traversal-order, and BFS
tree change using the existing playback controls.

Teaching clarity remains a requirement, but when otherwise acceptable alternatives compete, prefer
the smaller design that gets the complete BFS experience shipped sooner.

## Success Criteria

- Preset and custom undirected graphs containing 1–12 nodes work.
- BFS visits only the connected component reachable from the selected start node.
- Traversal and event sequences are deterministic from the submitted node order.
- Every backend event is presented as an individual playback step.
- At every step, the queue, traversal order, active node, examined edge, and accumulated BFS tree
  are understandable.
- Unreached, discovered, active, and processed states are distinguishable without relying on color.
- Existing sorting algorithms retain their visible behavior and semantic step ordering.
- The generic v1 API remains available for existing sorting clients while new family-aware clients
  use v2.
- The two insertion-only compatibility routes and their adapter are removed.
- Automated backend and frontend checks pass.

## Non-Goals

- Depth-first search
- Directed or weighted graphs
- Target search or shortest-path reconstruction UI
- Visual graph editing
- Zooming, panning, or dragging nodes
- Automatic graph layout or a graph-layout dependency
- Persistence, accounts, or shareable graph inputs
- Encoding graph contents in the URL
- Traversing disconnected components after the start component is exhausted
- Manual screen-reader testing as a release gate

## User Stories

1. As a learner, I want to enter an edge list, so that I can study BFS on my own graph.
2. As a learner, I want endpoints to declare nodes implicitly, so that `A-B` is a complete useful
   declaration.
3. As a learner, I want standalone node declarations, so that I can include isolated nodes.
4. As a learner, I want to choose the BFS start node from the parsed nodes, so that invalid starts
   cannot be submitted.
5. As a learner, I want neighbor order to follow node declaration order, so that I can predict and
   reproduce the traversal.
6. As a learner, I want every edge examination and already-discovered skip to be visible, so that I
   understand why BFS does or does not enqueue a node.
7. As a learner, I want the queue and traversal order visible at every step, so that the algorithm's
   control flow is explicit.
8. As a learner, I want discovered BFS-tree edges to remain visible, so that I can see the tree grow.
9. As a learner, I want unreachable nodes reported after completion, so that a disconnected graph
   is not mistaken for an incomplete trace.
10. As a learner, I want separate sorting and graph drafts retained when switching algorithms, so
    that experimenting in one family does not erase work in the other.
11. As a keyboard user, I want graph input, start selection, and playback controls to work without a
    pointer.
12. As a screen-reader user, I want an equivalent textual state description and meaningful
    announcements, so that SVG and color are not the only sources of information.
13. As a developer, I want the backend to be the canonical trace generator, so that traversal logic
    is not duplicated in the frontend.
14. As a developer, I want family, request, result, state, constraint, and event types to be
    discriminated, so that unsupported combinations cannot pass through untyped maps.

## Delivery Strategy

Deliver the milestone as two separately verifiable changes:

1. **Family platform and v2 migration.** Add the family-discriminated v2 catalog and trace contract,
   migrate sorting to it, split shared playback from family adapters, remove the two insertion-only
   routes, and prove sorting regressions have not changed visible behavior or semantic step order.
2. **BFS vertical slice.** Add backend BFS execution, graph parsing and validation, presets, graph
   rendering, learning content, accessibility behavior, and focused tests.

These changes may ship together, but the first must be testable without BFS and the second must not
require another platform rewrite.

Before production implementation, lock the JSON schemas, state invariants, parser grammar, event
ordering rules, presets, pseudocode mappings, explanations, and representative acceptance traces.

## API Versioning and Route Lifecycle

### Preserved v1 routes

- `GET /api/v1/algorithms`
- `POST /api/v1/algorithms/{algorithmId}/trace`

The existing generic v1 API remains available for sorting clients and retains its current sorting
contract. BFS is not added to v1.

### Removed compatibility routes

- `POST /api/algorithms/insertion-sort`
- `POST /api/v1/algorithms/insertion-sort`

Remove `LegacyTraceAdapter` and any production types used only by these routes. Removed routes return
HTTP 404 through normal routing; do not add replacement redirects or compatibility responses.

### New v2 routes

- `GET /api/v2/algorithms`
- `POST /api/v2/algorithms/{algorithmId}/trace`

The trace route remains the sole v2 execution route for every algorithm family. The selected
catalog algorithm determines the required request kind. A mismatched kind returns HTTP 400 Problem
Details with a stable `ALGORITHM_FAMILY_MISMATCH` code.

## V2 Contract

The exact field spelling and discriminator values below are normative. JSON examples may omit
events only where explicitly noted.

### Families and kinds

- Family values: `SORTING`, `GRAPH_TRAVERSAL`
- Input, result, and state discriminators use `kind` with the same values.
- Algorithm IDs remain stable. Register `bfs` after `insertion`, `selection`, `bubble`, `merge`,
  `quick`, and `heap` in catalog order.

### Catalog entry

```json
{
  "id": "bfs",
  "name": "Breadth-First Search",
  "family": "GRAPH_TRAVERSAL",
  "contractVersion": "2.0",
  "constraints": {
    "kind": "GRAPH_TRAVERSAL",
    "minimumNodes": 1,
    "maximumNodes": 12,
    "maximumEdges": 66,
    "nodeLabelPattern": "^[A-Za-z0-9_-]{1,16}$",
    "directed": false,
    "weighted": false
  }
}
```

Sorting catalog constraints use `kind: "SORTING"` and sorting-specific value-count and integer
limits. Family-specific constraints must not be represented by nullable fields on one universal
constraint object.

### BFS trace request

```json
{
  "kind": "GRAPH_TRAVERSAL",
  "nodes": ["A", "B", "C", "D"],
  "edges": [
    { "from": "A", "to": "B" },
    { "from": "A", "to": "C" }
  ],
  "startNode": "A"
}
```

`nodes` is ordered and controls deterministic neighbor visitation. Edges are undirected regardless
of endpoint order. The backend never derives node order from edges; the frontend parser submits the
order it derived from the text.

### BFS trace envelope

```json
{
  "apiVersion": "2.0",
  "algorithm": {
    "id": "bfs",
    "name": "Breadth-First Search",
    "family": "GRAPH_TRAVERSAL"
  },
  "input": {
    "kind": "GRAPH_TRAVERSAL",
    "nodes": ["A", "B", "C", "D"],
    "edges": [
      { "from": "A", "to": "B" },
      { "from": "A", "to": "C" }
    ],
    "startNode": "A"
  },
  "result": {
    "kind": "GRAPH_TRAVERSAL",
    "traversalOrder": ["A", "B", "C"],
    "parents": { "B": "A", "C": "A" },
    "unreachableNodes": ["D"],
    "visitedNodeCount": 3,
    "edgeExaminationCount": 4,
    "maximumQueueSize": 2
  },
  "limits": {
    "maximumEvents": 10000
  },
  "events": []
}
```

Sorting traces use family-specific `input`, `result`, and event-state objects rather than
`inputValues`, `resultValues`, or top-level `sortedRanges` on a shared envelope.

### BFS event

```json
{
  "sequence": 4,
  "type": "NODE_DISCOVERED",
  "pseudocodeLineId": "bfs-enqueue-neighbor",
  "state": {
    "kind": "GRAPH_TRAVERSAL",
    "nodeStatuses": {
      "A": "ACTIVE",
      "B": "DISCOVERED",
      "C": "UNREACHED",
      "D": "UNREACHED"
    },
    "queue": ["B"],
    "traversalOrder": ["A"],
    "parents": { "B": "A" },
    "examinedEdge": { "from": "A", "to": "B" }
  },
  "data": {
    "kind": "NODE_DISCOVERED",
    "node": "B",
    "parent": "A"
  }
}
```

Every event has a 1-based contiguous sequence, a pseudocode line identifier, a complete immutable
visible-state snapshot, and data whose `kind` matches `type`.

## Graph Input Grammar

The graph editor is a multiline edge-list textarea.

```text
A-B
A-C
B-D
E
```

- Ignore leading and trailing whitespace on each line and ignore blank lines.
- A node label contains 1–16 ASCII letters, digits, underscores, or hyphens.
- An unquoted label token contains only letters, digits, and underscores. A label containing a
  hyphen is enclosed in double quotes, for example `"node-one"`. Quotes are authoring syntax and
  are not part of the submitted label. Backslashes, escaped quotes, and whitespace inside quoted
  labels are not supported.
- A standalone label token declares an isolated node.
- `<label>-<label>` declares an undirected edge and declares both endpoint nodes. Examples include
  `A-B`, `"node-one"-B`, and `"node-one"-"node-two"`. Optional whitespace may surround the edge
  separator but not occur inside an unquoted token.
- Node declaration order is first appearance while scanning top-to-bottom and, within an edge,
  left-to-right. The example produces `A, B, C, D, E`.
- An unquoted `node-one` is parsed as the edge `node` to `one`, not as one node. To declare the
  hyphenated node, the user enters `"node-one"`. Unterminated quotes and lines that do not match
  either the standalone-node or edge production are errors.
- Self-loops are invalid.
- Repeating an edge in either direction is invalid. The error identifies the duplicate line and the
  original declaration line; the parser never silently deduplicates.
- Inputs contain 1–12 unique nodes and at most 66 unique edges.
- The UI displays the derived node order because that order affects traversal.
- The start selector is populated from successfully parsed nodes.
- If editing removes the selected start node, select the first remaining node automatically. If no
  valid node remains, clear the selection.
- Frontend validation prevents known-invalid submissions; the backend independently enforces every
  contract rule.

## Deterministic BFS Semantics

1. Create adjacency lists ordered by the submitted `nodes` array, not edge submission order.
2. Mark the start node `DISCOVERED` when it is enqueued.
3. Dequeue one node, mark it `ACTIVE`, and append it to traversal order.
4. Examine each neighbor in node-declaration order.
5. When an examined neighbor is `UNREACHED`, mark it `DISCOVERED`, record the active node as its
   parent, and enqueue it.
6. When an examined neighbor is already discovered, active, or processed, emit a skip without
   changing its parent.
7. After all neighbors have been examined, mark the active node `PROCESSED`.
8. Stop when the queue is empty. Do not restart from an unreachable node.

Node states follow one forward-only lifecycle:

```text
UNREACHED -> DISCOVERED -> ACTIVE -> PROCESSED
```

Exactly one node is `ACTIVE` between a dequeue event and its corresponding completion event. At all
other times, no node is active. No valid snapshot contains multiple active nodes.

`edgeExaminationCount` counts adjacency inspections, not unique undirected edges. Consequently, an
undirected edge may be counted twice. It equals the number of `EDGE_EXAMINED` events.

`visitedNodeCount` is numeric and equals `traversalOrder.length`. `parents` excludes the start and
unreachable nodes. `unreachableNodes` follows declaration order. `maximumQueueSize` is measured
after each enqueue, including the initial start-node enqueue.

## Event Model and Playback

BFS emits these typed events:

1. `TRAVERSAL_INITIALIZED`
2. `NODE_DEQUEUED`
3. `EDGE_EXAMINED`
4. `NODE_DISCOVERED`
5. `ALREADY_DISCOVERED_SKIPPED`
6. `NODE_COMPLETED`
7. `TRAVERSAL_COMPLETED`

Initialization includes the start node already discovered and queued. `NODE_DEQUEUED` makes that
node active and appends it to traversal order. Every `EDGE_EXAMINED` is a separate playback step;
the immediately following discovery or skip is also a separate step. Completion reports unreachable
nodes without changing them from `UNREACHED`.

The backend is the sole authority for traversal results, metrics, event order, and snapshots. The
frontend parses authoring input and renders returned events but does not independently execute BFS.

## Graph Workbench

- Split orchestration into shared playback plus two real family adapters: sorting and graph
  traversal.
- Preserve play, pause, next, previous, reset, speed, timeline scrubbing, cancellation,
  stale-response protection, and `?algorithm=` selection across both families.
- Keep separate in-memory sorting and graph input drafts when switching families.
- Changing algorithms stops playback, clears the current trace and counters, restores that family's
  draft, and waits for an explicit visualization request.
- Provide branching, cycle, and disconnected presets. Preset node order and start node are fixed and
  tested.
- Use deterministic circular SVG placement with labeled nodes and edges.
- Show the currently examined edge transiently.
- Once a parent is recorded, keep that BFS-tree edge emphasized in that and all later snapshots.
  Current-edge and tree-edge treatments must be visually and textually distinct.
- Show the queue and traversal order outside the SVG at every step.
- Dense valid graphs may contain overlapping edges. Deterministic rendering and an equivalent
  textual description are required; visually uncluttered rendering of every 12-node graph is not.

## Accessibility Requirements

- Node states must differ through text, shape, pattern, iconography, or another non-color cue.
- The examined edge and accumulated BFS-tree edges must have non-color distinctions.
- The SVG has an accessible name and description appropriate to the current state.
- An equivalent textual status lists every node and state, the queue, traversal order, examined edge,
  and BFS-tree parent relationships.
- Meaningful changes are announced without repeating the entire graph on every step.
- Graph editing, start selection, presets, algorithm selection, and playback are keyboard operable.
- Existing reduced-motion behavior applies to graph playback.
- Automated tests cover semantics, accessible names, textual equivalence, announcements, keyboard
  interaction, and reduced-motion behavior.
- A manual screen-reader verification pass is encouraged but is not part of the release gate.

## Validation and Errors

Reject requests with structured Problem Details for:

- Unknown algorithms
- Request kind and catalog-family mismatch
- Missing, empty, duplicate, or invalid node labels
- Fewer than 1 or more than 12 nodes
- More than 66 unique edges
- Self-loops
- Duplicate or reversed-duplicate edges
- Edges containing endpoints absent from the submitted `nodes` list
- Missing start node or a start node absent from `nodes`
- Malformed JSON
- Trace limit overflow

Problem responses include a stable machine-readable code and field or line details where applicable.
The v2 API documentation must enumerate the final codes and status values.

## Testing Requirements

### Contract and platform tests

- v2 catalog ordering and family-discriminated constraints
- v2 sorting execution and family mismatch
- v1 sorting routes remain operational and unchanged
- both insertion-only compatibility routes return 404
- unknown algorithm and malformed request behavior
- typed serialization without arbitrary backend objects or frontend `any`
- sorting regression fixtures preserve visible behavior and semantic step ordering

### BFS algorithm tests

- Single node
- Chain
- Branching graph
- Cycle and duplicate paths
- Disconnected graph
- Neighbor order based on node declaration rather than edge order
- Maximum 12-node and 66-edge graph
- Every validation rule
- Immutable snapshots
- Contiguous sequences
- Exactly zero or one active node per snapshot
- Accurate traversal, parents, unreachable nodes, visited count, adjacency-examination count, and
  maximum queue size
- Exact representative acceptance traces

### Frontend tests

- Edge-list grammar, whitespace, isolated nodes, and first-appearance ordering
- Invalid labels, ambiguous hyphens, self-loops, duplicates, reversed duplicates, and limit errors
- Duplicate feedback references both declarations
- Start selection and automatic fallback after edits
- Branching, cycle, and disconnected presets
- Family switching and retained drafts
- Request cancellation and stale-response protection
- Every event as an individual playback step
- Queue, traversal order, node states, examined edge, and persistent BFS-tree rendering
- Completion with unreachable nodes
- Accessible names, text equivalent, live announcements, keyboard controls, and reduced motion

### Verification commands

From `backend/`:

```bash
./mvnw test
./mvnw clean package
```

From `frontend/`:

```bash
npm run lint
npm test
npm run build
```

## Documentation Requirements

- Add v2 API documentation with complete sorting and BFS examples.
- Keep v1 documentation available and mark it as sorting-only.
- Document the v1-to-v2 migration, including removal of the insertion-only routes.
- Document the final edge-list grammar and its ambiguity resolution.
- Document declaration-order determinism, validation limits, event meanings, snapshot invariants,
  and metric definitions.
- Update accessibility documentation for graph input, non-color node and edge states, queue and
  traversal output, keyboard playback, announcements, and reduced motion.

## Definition of Done

The milestone is complete when:

1. The family-discriminated v2 contract is documented and implemented without untyped event data.
2. Generic v1 sorting remains functional and the two insertion-only routes and adapter are gone.
3. All six sorting algorithms preserve their visible behavior and semantic step order through the
   migration.
4. BFS satisfies the deterministic semantics and all state invariants in this PRD.
5. The workbench provides the complete graph authoring, playback, visualization, textual, and
   accessibility experience described here.
6. Representative schemas, presets, pseudocode, explanations, and acceptance traces are locked in
   tests or versioned documentation.
7. Backend tests and packages pass; frontend tests, lint, type checking, and production build pass.
