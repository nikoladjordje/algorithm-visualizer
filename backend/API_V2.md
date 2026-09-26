# Algorithm Trace API v2

API v2 is the family-discriminated contract for sorting, searching, graph traversal, and pathfinding. All
responses use JSON; errors use `application/problem+json`.

## Routes and catalog

- `GET /api/v2/algorithms`
- `POST /api/v2/algorithms/{algorithmId}/trace`

Catalog order is `insertion`, `selection`, `bubble`, `merge`, `quick`, `heap`, `linear-search`,
`binary-search`, `bfs`, `dfs`, then `dijkstra`. Every entry contains `id`, `name`, `family`, `contractVersion: "2.0"`, and
family-specific constraints.

| Family | Algorithms | Constraints |
| --- | --- | --- |
| `SORTING` | Six sorting algorithms | `minimumValues: 1`, `maximumValues: 50`, signed 32-bit bounds |
| `SEARCH` | `linear-search`, `binary-search` | 0–50 signed 32-bit values and signed 32-bit target; binary search requires non-decreasing values |
| `GRAPH_TRAVERSAL` | `bfs`, `dfs` | 1–12 nodes, at most 66 edges, undirected, optional weights 1–99 |
| `PATHFINDING` | `dijkstra` | Same graph bounds, weights 1–99, `unweightedEdgeCost: 1`, `destinationRequired: true` |

Graph labels match `^[A-Za-z0-9_-]{1,16}$`. Both graph families advertise `directed: false` and
`weighted: true`; “weighted” means the input may carry weights, not that every algorithm uses them.

## Common trace envelope

```text
Trace<TInput, TResult, TEvent> {
  apiVersion: "2.0"
  algorithm: { id, name, family }
  input: TInput
  result: TResult
  limits: { maximumEvents: 10000 }
  events: TEvent[]
}
```

Events have a contiguous 1-based `sequence`, `type`, `pseudocodeLineId`, complete immutable
`state`, and typed `data`. Input, result, state, and algorithm family discriminators agree, and
`data.kind` equals event `type`.

## Sorting

Request:

```json
{ "kind": "SORTING", "values": [3, 1, 2] }
```

Representative response (later events omitted):

```json
{
  "apiVersion": "2.0",
  "algorithm": { "id": "insertion", "name": "Insertion Sort", "family": "SORTING" },
  "input": { "kind": "SORTING", "values": [3, 1, 2] },
  "result": { "kind": "SORTING", "values": [1, 2, 3] },
  "limits": { "maximumEvents": 10000 },
  "events": [{
    "sequence": 1,
    "type": "SELECT",
    "pseudocodeLineId": "select-current",
    "state": {
      "kind": "SORTING",
      "items": [{ "id": 0, "value": 3 }, { "id": 1, "value": 1 }, { "id": 2, "value": 2 }],
      "sortedRanges": [{ "fromIndex": 0, "throughIndex": 0 }]
    },
    "data": { "kind": "SELECT", "index": 1, "item": { "id": 1, "value": 1 } }
  }]
}
```

Item `id` preserves identity while values move. Sorted-range bounds are inclusive.

| Event types | Data fields |
| --- | --- |
| `SELECT` | `index`, `item` |
| `READ`, `COMPARE` | `indices`, `items`; compare also has `result`: `LESS`, `EQUAL`, or `GREATER` |
| `SWAP` | `indices` |
| `WRITE` | `indices`, `items` |
| `MARK_SORTED`, `SPLIT_RANGE` | `fromIndex`, `throughIndex` |
| `PASS_START`, `PASS_COMPLETE`, `NO_SWAP_COMPLETE` | `pass`, `swapped` |
| `MINIMUM_UPDATE` | `index`, `item` |
| `BEGIN_MERGE`, `BUFFER_MOVE`, `COMPLETE_MERGE` | `left`, `middle`, `right`, `buffer` |
| `PIVOT_SELECT`, `PARTITION_ACTIVE`, `PARTITION_COMPLETE` | `left`, `right`, `scanner`, `boundary`, `pivotIndex` |
| `BUILD_HEAP`, `ROOT_SELECT`, `HEAPIFY`, `HEAP_SHRINK` | `heapSize`, `rootIndex`, `childIndex` |

Sorting traces are locked in `src/test/resources/contracts/v2/sorting-regression-traces.json`.

## Search

Both search algorithms preserve the authored sequence and receive a search target:

```json
{ "kind": "SEARCH", "values": [1, 3, 5, 7], "target": 5 }
```

Their result is `{ "kind": "SEARCH", "found": boolean, "foundIndex": number | null, "comparisons": number }`.
An empty sequence and an absent target are successful not-found outcomes. `foundIndex` is `null`
when `found` is false. Search state contains `values`, `target`, `selectedIndex`, and
`inspectedIndices`; binary state additionally contains inclusive `lowerBound` and `upperBound`.

| Event type | Meaning |
| --- | --- |
| `SEARCH_INITIALIZED` | Establish the initial inspection state or binary interval. |
| `CANDIDATE_SELECTED` | Select one value before comparing it. |
| `TARGET_COMPARED` | Compare the selected value with the target. |
| `SEARCH_INTERVAL_NARROWED` | Binary search discards a half after a non-match. |
| `SEARCH_FOUND` | Complete at the matching index. |
| `SEARCH_NOT_FOUND` | Complete after all linear candidates or an empty binary interval. |

Linear search inspects from left to right and returns the first match in that order. Binary search
requires non-decreasing input; an adjacent inversion is rejected rather than sorted. It returns the
first equality probed, which need not be the leftmost duplicate. Search traces are locked in
`src/test/resources/contracts/v2/search-regression-traces.json`.

## Shared weighted graph input

Graph edges have `from`, `to`, and an optional `weight`:

```json
[
  { "from": "A", "to": "B", "weight": 7 },
  { "from": "B", "to": "C" }
]
```

Weights are integers from 1 through 99. Omission is preserved in requests and responses; it is not
serialized as an explicit weight of one. Dijkstra interprets an omitted weight as cost one. BFS and
DFS ignore weights, so adding or changing weights cannot alter their traces, traversal order,
search tree, or metrics.

Graphs are undirected. Nodes are unique and declaration-ordered. Edges must connect two declared
nodes and must be unique by unordered endpoint pair; reversed duplicates and self-loops are
invalid. `startNode` must be declared. A destination must be declared when supplied.

## Breadth-first search

Request:

```json
{
  "kind": "GRAPH_TRAVERSAL",
  "nodes": ["A", "C", "B", "D"],
  "edges": [
    { "from": "A", "to": "B" },
    { "from": "A", "to": "C" },
    { "from": "C", "to": "D" }
  ],
  "startNode": "A",
  "destination": "D"
}
```

`destination` is optional. Without it, BFS exhausts the start component and preserves the original
unweighted v2 contract and event ordering. With it, BFS stops when the destination is dequeued and
reconstructs a fewest-edge path from the search tree. Edge weights never affect BFS.

Representative result:

```json
{
  "kind": "GRAPH_TRAVERSAL",
  "traversalOrder": ["A", "C", "B", "D"],
  "parents": { "C": "A", "B": "A", "D": "C" },
  "unreachableNodes": [],
  "visitedNodeCount": 4,
  "edgeExaminationCount": 6,
  "maximumQueueSize": 2
}
```

A targeted result adds `pathFound`, `path`, `pathEdgeCount`, and `unexploredNodes`. When the
destination is unreachable, `pathFound` is `false`, `path` is empty, `pathEdgeCount` is omitted,
and `unreachableNodes` contains the nodes proven unreachable. When BFS stops early,
`unexploredNodes` contains nodes that were not visited; those nodes are not claimed to be
unreachable.

Every state contains `kind`, `nodeStatuses`, `queue`, `traversalOrder`, `parents`, and nullable
`examinedEdge`. The final targeted state also contains `selectedPath`. Statuses move only through:

```text
UNREACHED -> DISCOVERED -> ACTIVE -> PROCESSED
```

At most one node is active. BFS stops when the start component is exhausted; unreachable nodes
stay `UNREACHED` and are reported in declaration order. Parents exclude the start and unreachable
nodes.

| Type | Pseudocode ID | Data | Meaning |
| --- | --- | --- | --- |
| `TRAVERSAL_INITIALIZED` | `bfs-initialize` | `startNode` | Discover and enqueue the start. |
| `NODE_DEQUEUED` | `bfs-dequeue` | `node` | Dequeue, activate, and visit a node. |
| `EDGE_EXAMINED` | `bfs-examine-edge` | `from`, `to` | Inspect one adjacency entry. |
| `NODE_DISCOVERED` | `bfs-enqueue-neighbor` | `node`, `parent` | Record a parent and enqueue a new node. |
| `ALREADY_DISCOVERED_SKIPPED` | `bfs-skip-neighbor` | `from`, `to` | Skip a node already seen. |
| `NODE_COMPLETED` | `bfs-complete-node` | `node` | Mark the active node processed. |
| `TRAVERSAL_COMPLETED` | `bfs-complete-traversal` | `traversalOrder`, `unreachableNodes` | Finish the start component. |
| `PATH_RECONSTRUCTED` | `bfs-reconstruct-path` | `destination`, `pathFound`, `path`, optional `pathEdgeCount` | Publish a fewest-edge path or a valid no-path result. |

A one-node acceptance trace is exactly `TRAVERSAL_INITIALIZED`, `NODE_DEQUEUED`,
`NODE_COMPLETED`, `TRAVERSAL_COMPLETED`.

### Metrics

- `visitedNodeCount` equals `traversalOrder.length`.
- `edgeExaminationCount` counts adjacency inspections and equals the number of `EDGE_EXAMINED`
  events. A reachable undirected edge can be counted from both endpoints.
- `maximumQueueSize` is the largest queue observed after an enqueue, including initialization.

## Iterative depth-first search

DFS uses the `GRAPH_TRAVERSAL` request shown above but rejects a `destination`. It accepts weighted
edges for experiment reuse while ignoring their weights. Its explicit stack visits eligible
neighbors in `nodes` declaration order and traverses only the start component.

The result contains `kind`, `traversalOrder`, `parents`, `unreachableNodes`, `visitedNodeCount`,
`edgeExaminationCount`, and `maximumStackSize`. Every state contains `kind`, `nodeStatuses`,
`stack` in top-first order, `traversalOrder`, `parents`, and nullable `examinedEdge`. Node statuses
use the same `UNREACHED -> DISCOVERED -> ACTIVE -> PROCESSED` lifecycle as BFS.

| Type | Pseudocode ID | Data | User-facing meaning |
| --- | --- | --- | --- |
| `TRAVERSAL_INITIALIZED` | `dfs-initialize` | `startNode` | Discover and push the start onto the stack. |
| `NODE_POPPED` | `dfs-pop` | `node` | Pop and visit the top node. |
| `EDGE_EXAMINED` | `dfs-examine-edge` | `from`, `to` | Examine one adjacency entry. |
| `NODE_DISCOVERED` | `dfs-push-neighbor` | `node`, `parent` | Record a parent and push a new node. |
| `ALREADY_DISCOVERED_SKIPPED` | `dfs-skip-neighbor` | `from`, `to` | Skip a node already discovered. |
| `NODE_COMPLETED` | `dfs-complete-node` | `node` | Mark the active node processed. |
| `TRAVERSAL_COMPLETED` | `dfs-complete-traversal` | `traversalOrder`, `unreachableNodes` | Finish the start component. |

DFS metrics are defined as follows:

- `visitedNodeCount` equals `traversalOrder.length`.
- `edgeExaminationCount` counts adjacency inspections and `EDGE_EXAMINED` events.
- `maximumStackSize` is the largest top-first stack snapshot, including initialization.

## Dijkstra pathfinding

Request:

```json
{
  "kind": "PATHFINDING",
  "nodes": ["A", "D", "B", "C"],
  "edges": [
    { "from": "A", "to": "D", "weight": 9 },
    { "from": "A", "to": "B", "weight": 2 },
    { "from": "B", "to": "C" },
    { "from": "C", "to": "D", "weight": 2 }
  ],
  "startNode": "A",
  "destination": "D"
}
```

`destination` is required. The ordered priority frontier removes the smallest tentative distance;
ties use node declaration order. Incident edges are also examined in declaration order. Equal-cost
candidates are rejected, preserving the first search-tree parent. Execution stops when the
destination is removed from the frontier and settled.

Successful result:

```json
{
  "kind": "PATHFINDING",
  "pathFound": true,
  "path": ["A", "B", "C", "D"],
  "totalCost": 5,
  "settledOrder": ["A", "B", "C", "D"],
  "parents": { "D": "C", "B": "A", "C": "B" },
  "settledNodeCount": 4,
  "relaxationAttemptCount": 6,
  "successfulUpdateCount": 4,
  "rejectedUpdateCount": 2,
  "maximumFrontierSize": 2
}
```

A no-path result has `pathFound: false`, an empty `path`, and no `totalCost`; it is a successful
HTTP response. Every state contains `kind`, `nodeStatuses`, `tentativeDistances` (null means
infinity), `parents`, an ordered `frontier` of `{node, distance}`, nullable `examinedEdge`, and a
completion-only `selectedPath`. Statuses are `UNREACHED`, `FRONTIER`, `ACTIVE`, and `SETTLED`.

| Type | Pseudocode ID | Data | User-facing meaning |
| --- | --- | --- | --- |
| `PATHFINDING_INITIALIZED` | `dijkstra-initialize` | `startNode`, `destination` | Set the start distance to zero and add it to the frontier. |
| `STALE_FRONTIER_ENTRY_SKIPPED` | `dijkstra-skip-stale` | `node`, `queuedDistance`, optional `currentDistance` | Discard an obsolete queued priority. |
| `NODE_SELECTED` | `dijkstra-select-node` | `node`, `distance` | Remove the smallest-distance frontier node. |
| `NODE_SETTLED` | `dijkstra-settle-node` | `node`, `distance` | Finalize the node's minimum cost. |
| `EDGE_EXAMINED` | `dijkstra-examine-edge` | `from`, `to`, `weight`, `candidateCost`, optional `currentKnownCost` | Calculate a relaxation candidate. |
| `DISTANCE_UPDATED` | `dijkstra-update-distance` | `node`, `parent`, optional `previousDistance`, `newDistance` | Record an improving distance and search-tree parent. |
| `RELAXATION_REJECTED` | `dijkstra-reject-relaxation` | `from`, `to`, `weight`, `candidateCost`, optional `currentKnownCost` | Reject a non-improving candidate. |
| `PATH_RECONSTRUCTED` | `dijkstra-reconstruct-path` | `destination`, `pathFound`, `path`, optional `totalCost` | Publish the minimum-cost path or a valid no-path result. |

Dijkstra metrics are defined as follows:

- `settledNodeCount` equals `settledOrder.length` and counts only work before termination.
- `relaxationAttemptCount` counts examined adjacency entries and `EDGE_EXAMINED` events.
- `successfulUpdateCount` counts `DISTANCE_UPDATED` events.
- `rejectedUpdateCount` counts `RELAXATION_REJECTED` events.
- `maximumFrontierSize` is the largest deduplicated current priority frontier; stale entries do not
  inflate it.

## Graph trace invariants and compatibility

- Sequences are contiguous and 1-based; snapshots and their collections are immutable.
- At most one graph node is `ACTIVE` in a snapshot.
- A node is discovered or added to a frontier at most once at its current best cost; first parents
  remain stable for BFS/DFS and for equal-cost Dijkstra alternatives.
- Search-tree edges come from `parents`. A selected path appears only in the reconstruction event.
- Existing destination-free, unweighted BFS requests omit all targeted fields and retain their
  original result and event ordering.
- Weighted BFS and DFS requests preserve authored weights in the envelope while weights do not
  change algorithm behavior.
- V1 remains sorting-only. API v2 adds `PATHFINDING` without changing `SORTING` or
  `GRAPH_TRAVERSAL` discriminators.

## Errors

```json
{
  "type": "urn:problem:invalid-input",
  "title": "Invalid input",
  "status": 400,
  "detail": "Provide a valid graph with 1–12 nodes, at most 66 edges, and a declared start node",
  "instance": "/api/v2/algorithms/bfs/trace",
  "code": "INVALID_INPUT"
}
```

| HTTP | Code | Condition |
| --- | --- | --- |
| 400 | `INVALID_INPUT` | Invalid values, nodes, edge weights, endpoints, start, or destination; graph errors include `field` |
| 400 | `MALFORMED_REQUEST` | Invalid JSON or fields of the wrong type |
| 400 | `ALGORITHM_FAMILY_MISMATCH` | `kind` does not match the algorithm; `field` is `kind` |
| 404 | `ALGORITHM_NOT_FOUND` | Unknown algorithm ID |
| 422 | `TRACE_LIMIT_EXCEEDED` | More than 10,000 events would be emitted |
| 500 | `INTERNAL_ERROR` | Unexpected failure |
