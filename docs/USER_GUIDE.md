# Workbench User Guide

Select an algorithm, edit its input, then choose **Visualize**. Switching algorithms stops
playback and clears the current trace. Sorting keeps its own draft; BFS, DFS, and Dijkstra share one
graph draft, start node, destination, and authored weights so the same experiment can be compared.
An algorithm that does not use a destination keeps that draft hidden and does not submit it. The
`?algorithm=` URL query selects an algorithm, but inputs are never placed in the URL.

## Playback

Use Play/Pause, Previous step, Next step, Reset, the timeline, and playback speed to inspect a
trace. Each step highlights pseudocode and explains its semantic event. All controls are keyboard
operable. A newer run or algorithm change cancels an in-flight request, and late responses cannot
replace the current family state.

## Sorting

Enter 1–50 signed 32-bit whole numbers separated by spaces or commas. Presets cover sorted,
reverse-sorted, duplicate, and negative values. The chart preserves item identity when equal values
move and shows operation counters and complexity notes.

## Graph authoring

Enter one declaration per line. Blank lines and surrounding whitespace are ignored.

```text
A-B
A-C
"node-one" - C
D
```

- `A` declares a standalone node; `A-B` declares an undirected edge and both endpoints.
- Unquoted labels contain 1–16 ASCII letters, numbers, or underscores.
- Hyphenated labels must be quoted, as in `"node-one"`; quotes are not part of the name.
- Backslashes, escaped quotes, and whitespace inside labels are unsupported.
- Add `:weight` to an edge, such as `A-B:7`. Weights are whole numbers from 1 through 99.
- Weighted and unweighted edges may be mixed. An omitted weight stays visibly unweighted and costs
  one only when Dijkstra uses it.
- First appearance from top to bottom and left to right determines node order. BFS and DFS use this
  order for neighbors; Dijkstra also uses it to resolve equal-distance frontier ties.
- Self-loops, repeated nodes, duplicate or reversed edges, malformed lines, and graphs over 12
  nodes or 66 edges are rejected. Duplicate-edge errors identify both declaration lines.
- Removing the selected start chooses the first remaining node; no valid graph clears it. Removing
  the selected destination clears that selection.

Presets populate an experiment without running it:

- **DFS depth** contrasts stack-based depth with queue-based breadth.
- **Cycle** exposes already-discovered checks.
- **Disconnected** leaves a component unreached.
- **Edges vs cost** gives BFS a direct fewest-edge path while Dijkstra chooses a longer,
  lower-cost path.
- **Mixed weights** combines explicit weights with cost-one unweighted edges.
- **Equal-cost tie** demonstrates declaration-order tie breaking and stable first parents.
- **Unreachable destination** demonstrates a valid completed no-path result.

Each preset selects a valid start and destination. DFS hides and omits the destination while
retaining it for a later BFS or Dijkstra run.

## Reading graph algorithms

The circular layout is deterministic. Labels, symbols, border weight, and dash patterns distinguish
node states without color. The visible key identifies every node state and edge treatment. The
transient examined edge is heavy and dashed, search-tree edges are heavy and solid, and a final
selected path is dotted. Edge-weight badges remain visible for every algorithm. Equivalent text
below the graph describes the frontier, traversal order or tentative distances, node states, search
tree, examined edge, selected path, and completion outcome.

These terms describe different things:

- **Traversal order** is the order nodes were visited; it is not necessarily a route.
- The **frontier** contains reached nodes not yet fully explored. BFS presents it as a queue, DFS as
  a top-first stack, and Dijkstra as a priority frontier ordered by tentative distance.
- The **search tree** is the current set of first-parent relationships and can contain more edges
  than the final selected path.
- A BFS **fewest-edge path** minimizes edge count and ignores edge weights.
- A Dijkstra **minimum-cost path** minimizes the sum of edge weights and may use more edges.

### Breadth-first search

BFS is a graph traversal. A destination is optional. Without one, BFS exhausts the selected start
component and reports unreached nodes in declaration order. With one, it stops when the destination
is dequeued and reconstructs a fewest-edge path. Nodes skipped by early success are **unexplored**,
not unreachable. If the frontier empties first, BFS completes normally with “no path.” BFS always
shows its queue and traversal order. When weights are present, a persistent note explains that BFS
ignores them.

### Iterative depth-first search

DFS is a graph traversal with an explicit stack shown top first. It follows one branch before
returning, reports traversal order and nodes outside the start component, and has no destination.
When weights are present, a persistent note explains that DFS ignores them.

### Dijkstra pathfinding

Dijkstra is pathfinding and requires a destination. It shows each node's tentative distance and an
ordered priority frontier. Every edge relaxation displays the candidate and known cost, followed by
a distance update or rejected alternative. Equal distances use node declaration order; equal-cost
routes keep the first search-tree parent. Dijkstra stops when the destination is settled, then
reconstructs the minimum-cost path and total cost. An unreachable destination completes normally
with an empty path and no total cost.

## Accessibility and request behavior

Loading, step explanations, and completion are announced through a live region. Standard controls
support keyboard operation and visible focus, including algorithm, graph input, presets, start,
destination, timeline, and playback controls. Frontier changes, node transitions, distance updates,
rejected relaxations, reconstruction, and no-path outcomes are available as text. When the operating
system requests reduced motion, graph, chart, button, and loading transitions and animations are
effectively removed while static symbols, labels, and patterns preserve meaning.

A newer run or algorithm switch aborts an in-flight request. A late response cannot replace the
currently selected algorithm. Validation feedback can be corrected and resubmitted; transient
request failures show a retry action without discarding the current draft.

## Versioned learning material

Sorting pseudocode mappings and explanations are in `frontend/src/adapters.ts`; graph-algorithm
mappings and explanations are in `frontend/src/graphAdapters.ts`; fixed graph experiments are in
`frontend/src/graphPresets.ts`. Contract schemas and representative sorting, BFS, DFS, and Dijkstra
traces are under `backend/src/test/resources/contracts/v2/`. Product behavior is specified in the
two graph milestone PRDs under `docs/`.
