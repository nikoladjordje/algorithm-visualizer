# Product Requirements: DFS and Pathfinding

## Problem Statement

The workbench currently demonstrates breadth-first traversal of an unweighted, undirected graph.
Learners cannot compare a queue-based traversal with a stack-based traversal, ask BFS for a route
to a destination, or see how edge weights change which route is optimal. The existing graph input,
trace playback, node states, parent relationships, and visualization provide a strong foundation,
but the product does not yet distinguish traversal order, a search tree, a fewest-edge path, and a
minimum-cost path.

The next milestone must add iterative depth-first search, target-aware BFS, weighted graph input,
and Dijkstra pathfinding without weakening the typed v2 contracts or changing existing BFS behavior
for existing requests.

## Solution

Extend the current graph workbench into a shared experiment that learners can run with BFS, DFS,
or Dijkstra. Preserve the authored graph, selected start node, destination, and edge weights when
switching algorithms, while clearing the previous trace. Each algorithm continues to produce a
canonical backend trace that the frontend plays without reimplementing the algorithm.

BFS remains a graph traversal and may optionally reconstruct a fewest-edge path. DFS remains a
start-component traversal and exposes its stack frontier. Dijkstra belongs to a new pathfinding
family, requires a destination, and reconstructs a minimum-cost path. Weighted and unweighted
edges may coexist; an unweighted edge has cost one for Dijkstra, while BFS and DFS ignore all edge
weights and say so persistently in the interface.

## User Stories

1. As a learner, I want to choose DFS, so that I can study a stack-based graph traversal.
2. As a learner, I want DFS to expose its stack at every meaningful step, so that I can understand
   how its frontier differs from BFS's queue.
3. As a learner, I want DFS to visit neighbors deterministically, so that I can predict and replay
   the same traversal.
4. As a learner, I want DFS neighbor visitation to follow node declaration order, so that BFS and
   DFS use the same visible ordering rule.
5. As a learner, I want a node to become discovered when it enters the DFS stack, so that a node is
   never represented in the frontier more than once.
6. As a learner, I want DFS to remain within the selected start node's connected component, so that
   its handling of disconnected graphs matches BFS.
7. As a learner, I want unreached nodes reported when DFS completes, so that disconnected nodes are
   not mistaken for missing execution steps.
8. As a learner, I want to select an optional destination for BFS, so that I can ask for a route
   instead of always traversing the entire reachable component.
9. As a learner, I want target-aware BFS to stop when the destination is dequeued, so that the trace
   ends when the destination is visited and its fewest-edge route is established.
10. As a learner, I want BFS to reconstruct the route from its search tree, so that I can understand
    how parent relationships produce a result.
11. As a learner, I want the search tree visible during execution and the selected route highlighted
    after reconstruction, so that those concepts are not conflated.
12. As a learner, I want BFS results described as a fewest-edge path, so that I do not mistake them
    for a minimum-cost path on a weighted graph.
13. As a learner, I want an unreachable BFS destination reported as a valid completed result, so
    that the absence of a route is not presented as malformed input or system failure.
14. As a learner, I want to attach positive integer weights to edges, so that I can model costs.
15. As a learner, I want weights limited to 1 through 99, so that examples remain readable and
    negative-weight behavior cannot invalidate Dijkstra's guarantees.
16. As a learner, I want weighted and unweighted edges in the same graph, so that simple edges do
    not require repetitive weight annotations.
17. As a learner, I want an unweighted edge to have cost one during Dijkstra pathfinding, so that
    mixed graph input has an explicit and predictable meaning.
18. As a learner, I want to choose Dijkstra and a destination, so that I can find a minimum-cost
    path through a weighted graph.
19. As a learner, I want Dijkstra to show tentative distances, so that I can see its current best
    known cost to each reached node.
20. As a learner, I want Dijkstra to show its priority frontier, so that I understand which reached
    node will be processed next.
21. As a learner, I want every edge-relaxation attempt shown, so that I understand both successful
    distance updates and rejected alternatives.
22. As a learner, I want equal-cost alternatives to preserve the first discovered parent, so that
    the reconstructed route is deterministic.
23. As a learner, I want equal-distance frontier ties resolved by node declaration order, so that
    execution is predictable without relying on node names.
24. As a learner, I want Dijkstra to stop when the destination is removed from the priority frontier,
    so that it stops once the destination's minimum cost is established.
25. As a learner, I want the final Dijkstra route and total cost highlighted after reconstruction,
    so that I can connect distance updates to the chosen result.
26. As a learner, I want an unreachable Dijkstra destination reported as a valid completed result,
    so that no-path outcomes are represented accurately.
27. As a learner, I want the interface to explain that BFS and DFS ignore edge weights, so that I
    do not infer weighted guarantees from their results.
28. As a learner, I want edge weights to remain visible while using BFS or DFS, so that I can compare
    their behavior with Dijkstra on the same graph.
29. As a learner, I want to keep my graph, start node, destination, and weights when switching among
    graph algorithms, so that I can compare them without rebuilding the experiment.
30. As a learner, I want an old trace cleared when I switch algorithms, so that results cannot be
    attributed to the wrong algorithm.
31. As a learner, I want traversal order, search tree, fewest-edge path, and minimum-cost path labeled
    distinctly, so that I understand what each visualization represents.
32. As a learner, I want pseudocode and a plain-language explanation for every DFS and Dijkstra
    event, so that visual changes remain connected to algorithm reasoning.
33. As a learner, I want presets that demonstrate DFS depth, BFS versus Dijkstra route differences,
    equal-cost ties, mixed weights, and unreachable destinations, so that important behaviors are
    easy to explore.
34. As a keyboard user, I want algorithm, start, destination, graph input, and playback controls to
    remain operable without a pointer.
35. As a screen-reader user, I want frontier changes, distance changes, rejected relaxations, and
    reconstructed routes announced textually, so that meaning does not depend on the graph drawing.
36. As a motion-sensitive user, I want reduced-motion preferences respected by all new graph
    visualizations, so that playback remains comfortable.
37. As a developer, I want existing sorting and destination-free BFS clients to retain their v2
    behavior, so that this milestone is additive rather than another platform migration.
38. As a developer, I want graph traversal and pathfinding contracts to remain discriminated and
    typed, so that algorithm-specific state is not represented through nullable universal fields.
39. As a developer, I want backend traces to remain the canonical execution model, so that DFS,
    BFS route reconstruction, and Dijkstra are not duplicated in frontend logic.
40. As a developer, I want deterministic complete snapshots and event sequences, so that traces can
    be replayed, tested, and documented reliably.

## Implementation Decisions

### Delivery scope and sequence

- Deliver iterative DFS, target-aware BFS, weighted graph authoring, and Dijkstra in one milestone.
- Implement the milestone as independently verifiable vertical slices: shared weighted-input and
  contract groundwork, DFS, BFS route reconstruction, then Dijkstra.
- Keep the existing limits of 1–12 nodes, at most 66 unique undirected edges, and at most 10,000
  trace events unless trace-size evidence demonstrates that a separate limit decision is required.
- Retain one graph draft across BFS, DFS, and Dijkstra. Switching algorithms clears playback state
  and the old trace but preserves the graph, start node, destination, and weights.
- Do not automatically execute when the algorithm, graph, start, or destination changes.

### API families and compatibility

- Extend API v2 additively; do not introduce v3 or replace existing v2 fields in place.
- Retain `GRAPH_TRAVERSAL` for BFS and DFS.
- Introduce `PATHFINDING` for Dijkstra, as established by the corresponding architecture decision.
- Continue using the single v2 catalog and trace routes for every algorithm family.
- Add `dfs` after `bfs` in the graph-traversal portion of catalog order and add `dijkstra` as the
  first pathfinding entry.
- Existing BFS requests with no destination and no edge weights must retain their current request,
  result, event ordering, metrics, and visible behavior.
- Catalog constraints remain family-specific. They advertise undirected graphs, optional edge
  weights for graph traversal, required supported weights for Dijkstra, the 1–99 weight range, and
  whether a destination is optional or required.
- A request kind that does not match the selected algorithm continues to return the existing family
  mismatch Problem Details response.

### Shared graph input and authoring

- Graphs remain undirected. Directed edges are not introduced by this milestone.
- Extend the existing line grammar with `A-B:7` for an explicitly weighted edge. Existing `A-B`
  syntax remains valid and represents an unweighted edge.
- Permit weighted and unweighted edges in the same graph.
- For minimum-cost pathfinding, every unweighted edge has cost one.
- Accept only integer weights from 1 through 99. Reject zero, negatives, decimals, missing values,
  out-of-range values, and trailing weight syntax with line-specific feedback.
- Preserve current quoting, label, node-order, self-loop, duplicate-edge, reversed-edge, node-count,
  and edge-count rules. Edge weight differences do not make duplicate endpoint pairs distinct.
- The serialized edge contract gains an optional weight. Omission preserves the distinction between
  an authored unweighted edge and an explicitly authored weight of one, even though both cost one
  to Dijkstra.
- Continue deriving deterministic node order from first appearance. Edge submission order does not
  control neighbor order or priority ties.
- Continue using the text editor for this milestone. Direct visual manipulation is deferred.

### Shared graph semantics and state

- Share only graph concepts with identical meanings: node statuses, parent relationships, examined
  edge, traversal order where applicable, and stable graph input.
- Keep algorithm-specific frontier and learning state typed separately. BFS owns queue state, DFS
  owns stack state, and Dijkstra owns priority-frontier and distance state.
- Do not create one universal graph state containing optional queue, stack, distance, and path fields.
- Preserve complete immutable visible-state snapshots and typed event data on every event.
- Use node declaration order as the project-wide deterministic tie-breaker whenever algorithm rules
  leave multiple graph nodes equally eligible.
- Render edge weights for every graph algorithm. When BFS or DFS is selected for a graph containing
  explicit weights, show a persistent explanation that those algorithms ignore weights.
- Keep search-tree edges visually distinct from the reconstructed selected path. Do not label parent
  edges as the final path during execution.

### Iterative depth-first search

- Implement DFS iteratively with an explicit stack; recursive DFS and call-frame visualization are
  not variants in this milestone.
- Require a start node and do not accept a DFS destination. DFS is a traversal, not target-oriented
  search in this milestone.
- Traverse only the connected component reachable from the selected start node. Report other nodes
  as unreached in declaration order.
- Mark the start node discovered when it is pushed. Mark every later node discovered when it is
  pushed, ensuring each node enters the stack at most once and receives at most one parent.
- Visit eligible neighbors in node declaration order. The backend may arrange stack insertion as
  needed, but the public traversal behavior follows declaration order rather than exposing a
  last-pushed implementation accident.
- Expose initialization, stack removal, edge examination, discovery/push, already-discovered skip,
  node completion, and traversal completion as distinct semantic events.
- Every DFS state exposes node statuses, stack contents, traversal order, parents, and the currently
  examined edge.
- Report traversal order, parents, unreached nodes, visited-node count, edge-examination count, and
  maximum stack size.

### Target-aware breadth-first search

- Add an optional destination to BFS input. Omitting it preserves current exhaustive start-component
  traversal exactly.
- When a destination is present, stop when that destination is dequeued, not when first discovered
  and not after exhausting the entire component.
- Reconstruct the fewest-edge path by following parent relationships from destination to start.
- Add an explicit route-reconstruction completion event rather than deriving the selected path only
  in the frontend.
- A start node equal to the destination completes successfully with a one-node path and zero edges.
- A destination outside the start component completes normally with `pathFound: false` and an empty
  path. It is not an input validation error or execution failure.
- Target-aware results expose whether a path was found, the ordered path nodes, and its edge count.
  They do not report the result as a minimum-cost path.
- Existing traversal metrics remain meaningful for work performed before target termination. Any
  nodes not processed because of target termination must not be described as unreachable.
- Distinguish nodes proven unreachable after frontier exhaustion from nodes merely left unexplored
  because the destination was reached early.

### Dijkstra pathfinding

- Register Dijkstra under `PATHFINDING` and require declared start and destination nodes.
- Use non-negative behavior guaranteed by the authored positive integer weights; an unweighted edge
  contributes cost one.
- Maintain tentative distances, parents, node status, examined edge, and a deterministic priority
  frontier in complete event snapshots.
- Remove the frontier node with the smallest tentative distance. Resolve equal-distance ties by node
  declaration order.
- Stop when the destination is removed from the priority frontier. At that point its minimum cost is
  established.
- Examine incident edges in node declaration order.
- Expose every relaxation attempt, including the candidate cost and current known cost. Emit distinct
  semantic outcomes for a successful distance update and a rejected non-improving candidate.
- When a candidate cost equals the current distance, reject the update and retain the first parent.
- Present discovered parent edges as a changing search tree during execution. Reconstruct and mark
  the selected minimum-cost path only after the destination is finalized.
- A start node equal to the destination completes successfully with a one-node path and total cost
  zero.
- An unreachable destination completes normally with `pathFound: false`, an empty path, and no total
  cost. It is not a validation error or execution failure.
- Results expose path-found status, ordered path nodes, total cost when found, settled-node count,
  edge-relaxation attempt count, successful update count, rejected update count, and maximum priority
  frontier size.

### Frontend learning experience

- Introduce graph-algorithm adapters so pseudocode, explanations, metrics, frontier presentation,
  result language, and visual annotations do not accumulate as algorithm-specific conditionals in
  the main workbench.
- Continue using the shared playback controls, timeline, request lifecycle, stale-request protection,
  and graph renderer.
- Display a queue for BFS, a stack for DFS, and an ordered priority frontier with tentative distances
  for Dijkstra.
- Display the selected start and optional or required destination controls according to algorithm
  capability. Preserve the destination draft when switching through an algorithm that does not use
  it.
- Use the canonical glossary language in visible content: traversal, traversal order, search tree,
  frontier, fewest-edge path, minimum-cost path, destination, and edge weight.
- Never use color as the sole distinction between unreached, discovered, active, processed, search
  tree, examined edge, and selected path states.
- Announce meaningful frontier, node-state, distance, relaxation, completion, and no-path changes to
  assistive technology without narrating purely decorative motion.

## Testing Decisions

Tests assert observable algorithm behavior, serialized contracts, and user-visible learning behavior
rather than private data structures. Preserve the three established seams from the BFS milestone:

1. **Backend HTTP boundary.** Verify catalog discovery, family discrimination, request validation,
   trace serialization, additive BFS compatibility, algorithm-specific input/result/state/event
   contracts, structured errors, and trace limits.
2. **Frontend workbench boundary.** Verify algorithm selection, retained drafts, cleared traces,
   destination requirements, weighted-input feedback, persistent ignored-weight explanations,
   playback, explanations, frontier presentation, metrics, result terminology, accessibility, and
   unavailable/request-race behavior.
3. **Focused algorithm boundary.** Verify DFS traversal invariants, BFS target termination and path
   reconstruction, and Dijkstra distances, relaxations, tie-breaking, termination, reconstructed
   paths, and summary metrics.

Use existing BFS backend tests, controller contract tests, frontend workbench tests, input-parser
tests, graph visualizer tests, and deterministic contract fixtures as prior art. Add representative
acceptance fixtures for every new trace shape.

Test at least these scenarios:

- One-node graph, including start equal to destination.
- A simple chain and branching graph.
- A cycle and an already-discovered neighbor.
- A disconnected graph and unreachable destination.
- Declaration order that differs from lexical order.
- DFS stack ordering at a branching node.
- BFS early termination with reached but unprocessed nodes remaining.
- Weighted and unweighted edges in one graph.
- A graph where the fewest-edge path differs from the minimum-cost path.
- Dijkstra successful and rejected relaxations.
- Equal-cost routes and equal-distance frontier ties.
- Explicit weight one versus omitted weight.
- Minimum and maximum valid weights and every invalid weight category.
- Duplicate and reversed edges with equal or different authored weights.
- Maximum graph size and trace-limit behavior.
- Switching BFS, DFS, and Dijkstra while retaining the draft and clearing playback.
- Keyboard operation, textual equivalents, live announcements, non-color cues, and reduced motion.

After each vertical slice, run its focused backend and frontend tests. Before completing the
milestone, run the full backend suite and package build plus the frontend test, lint, and production
build commands.

## Out of Scope

- Directed graphs.
- Negative, zero, decimal, infinite, or larger-than-99 edge weights.
- Bellman-Ford, A*, bidirectional search, Floyd-Warshall, or all-pairs pathfinding.
- Recursive DFS or a call-stack visualization.
- DFS target search or DFS route claims.
- Full-graph traversal that automatically restarts from every disconnected component.
- Computing all-destination Dijkstra results when no destination is selected.
- Storing or visualizing every equally optimal parent or every equally optimal path.
- Side-by-side synchronized algorithm playback.
- Direct visual creation, deletion, dragging, zooming, or panning of graph nodes and edges.
- Directed-edge grammar or arrow rendering.
- Persistence, accounts, server-saved graphs, or shareable graph contents in the URL.
- A universal graph event payload or state object with nullable algorithm-specific fields.
- Changes to sorting trace semantics.

## Further Notes

The canonical terminology is defined in the project glossary. The separation between graph
traversal and pathfinding API families is governed by the corresponding architecture decision.

Suggested issue breakdown:

1. Extend graph grammar, validation, contracts, rendering, and tests for optional weights.
2. Extract the graph-algorithm adapter boundary while preserving current BFS behavior.
3. Implement the complete iterative DFS vertical slice.
4. Add shared destination controls and target-aware BFS route reconstruction.
5. Introduce the pathfinding family contracts and catalog capability.
6. Implement the complete Dijkstra vertical slice.
7. Add comparison-oriented presets, learning content, accessibility coverage, and documentation.
8. Lock representative contract fixtures and run the complete regression suite.

The issue tracker and `ready-for-agent` triage vocabulary were not configured in this session, so
this specification is intentionally created as a local project document and is not published to an
external tracker.
