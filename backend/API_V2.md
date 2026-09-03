# Algorithm Trace API v2

API v2 is the family-discriminated contract for sorting and graph traversal. All responses use
JSON; errors use `application/problem+json`.

## Routes and catalog

- `GET /api/v2/algorithms`
- `POST /api/v2/algorithms/{algorithmId}/trace`

Catalog order is `insertion`, `selection`, `bubble`, `merge`, `quick`, `heap`, then `bfs`. Every
entry contains `id`, `name`, `family`, `contractVersion: "2.0"`, and family-specific constraints.
Sorting accepts 1–50 signed 32-bit integers. BFS accepts 1–12 nodes, at most 66 edges, labels
matching `^[A-Za-z0-9_-]{1,16}$`, and advertises `directed: false`, `weighted: false`.

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
  "startNode": "A"
}
```

`nodes` controls deterministic neighbor order; edge order does not. Edges are undirected, unique
even when reversed, non-self-looping, and reference declared nodes. The start is declared.

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

Every state contains `kind`, `nodeStatuses`, `queue`, `traversalOrder`, `parents`, and nullable
`examinedEdge`. Statuses move only through:

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

A one-node acceptance trace is exactly `TRAVERSAL_INITIALIZED`, `NODE_DEQUEUED`,
`NODE_COMPLETED`, `TRAVERSAL_COMPLETED`.

### Metrics

- `visitedNodeCount` equals `traversalOrder.length`.
- `edgeExaminationCount` counts adjacency inspections and equals the number of `EDGE_EXAMINED`
  events. A reachable undirected edge can be counted from both endpoints.
- `maximumQueueSize` is the largest queue observed after an enqueue, including initialization.

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
| 400 | `INVALID_INPUT` | Invalid values, nodes, edges, endpoints, or start |
| 400 | `MALFORMED_REQUEST` | Invalid JSON or fields of the wrong type |
| 400 | `ALGORITHM_FAMILY_MISMATCH` | `kind` does not match the algorithm; `field` is `kind` |
| 404 | `ALGORITHM_NOT_FOUND` | Unknown algorithm ID |
| 422 | `TRACE_LIMIT_EXCEEDED` | More than 10,000 events would be emitted |
| 500 | `INTERNAL_ERROR` | Unexpected failure |
