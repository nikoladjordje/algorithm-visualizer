# Algorithm Visualizer

An interactive learning workbench for exploring algorithms one semantic step at a time. The
application builds canonical traces on the backend and plays them in an accessible React interface,
keeping algorithm behavior separate from presentation and playback.

## Current capabilities

- Visualize insertion, selection, bubble, merge, quick, and heap sort.
- Search an authored sequence with linear or binary search, including indexed playback, interval
  narrowing, and valid not-found outcomes.
- Construct a binary search tree from an authored insertion sequence, then inspect lookup,
  preorder, inorder, or postorder operations one semantic step at a time.
- Author weighted or unweighted undirected graphs and explore them with breadth-first search,
  iterative depth-first search, or Dijkstra pathfinding.
- Play, pause, reset, seek, step forward or backward, and adjust playback speed.
- Inspect pseudocode, operation metrics, algorithm state, and explanatory text at every step.
- Compare BFS's queue, DFS's stack, and Dijkstra's ordered priority frontier while retaining the
  same graph, start, destination, and weights.
- Inspect traversal order, search-tree relationships, examined edges, tentative distances,
  fewest-edge paths, minimum-cost paths, and valid no-path outcomes visually and textually.
- Receive clear validation feedback for malformed graph input and invalid tree insertion sequences.

## Architecture

This repository contains two independently built applications:

```text
frontend/  React 19, TypeScript, Vite, Vitest, Testing Library
backend/   Java 25, Spring Boot 4, Maven, JUnit 5
```

The frontend requests algorithm metadata and traces from the backend. During local development,
Vite proxies `/api` requests to the Spring Boot server at `http://localhost:8080`.

The v2 API uses family-discriminated contracts for sorting, search, graph traversal, pathfinding,
and trees. BFS and DFS remain `GRAPH_TRAVERSAL`; Dijkstra uses `PATHFINDING`; the binary search
tree uses `TREE`. A trace contains immutable snapshots and typed semantic events, allowing the
frontend to render any playback step without reimplementing the algorithm.

See the [v2 API reference](./backend/API_V2.md), [v1 compatibility reference](./backend/API_V1.md),
and [workbench user guide](./docs/USER_GUIDE.md) for complete contracts and behavior.

## Prerequisites

- Node.js 20.19 or newer
- Java 25

Maven does not need to be installed globally; the backend includes the Maven wrapper.

## Run locally

Start the backend:

```bash
cd backend
./mvnw spring-boot:run
```

In another terminal, install the locked frontend dependencies and start Vite:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

On Windows, use `mvnw.cmd` instead of `./mvnw`.

## Verification

Run frontend checks from `frontend/`:

```bash
npm test
npm run lint
npm run build
```

Run backend checks from `backend/`:

```bash
./mvnw test
./mvnw clean package
```

Generated directories such as `frontend/node_modules/`, `frontend/dist/`, and `backend/target/`
should not be committed.

## Graph input

Enter one standalone node or undirected edge per line. Node order is determined by first
appearance and controls BFS/DFS neighbor order and Dijkstra tie breaking.

```text
A-C
A-B:7
"node-one" - C
D
```

Unquoted labels may contain letters, numbers, and underscores. Quote labels that contain hyphens.
A graph may contain at most 12 nodes and 66 unique edges. Add an optional integer weight from 1–99
after a colon. Self-loops and duplicate edges—including the same edge written in reverse—are
rejected.

BFS optionally reconstructs a fewest-edge path and ignores weights. DFS traverses the start
component with an explicit stack and also ignores weights. Dijkstra requires a destination, treats
unweighted edges as cost one, and reconstructs a minimum-cost path. An unreachable destination is a
valid completed result rather than an error.

## Binary search tree input

Enter an ordered sequence of 1–31 unique signed 32-bit integers. The application first constructs
the tree in that exact insertion order, then plays the selected lookup or traversal. Duplicate
values are rejected so the tree retains its strict ordering invariant.

Lookup may complete either with a found value or a valid not-found result. Preorder, inorder, and
postorder each visit the same constructed tree in their respective defined orders; inorder output
is strictly ascending.

## Roadmap

| Algorithm family | Status | Direction |
| --- | --- | --- |
| Sorting | Available | Expand explanations and compare algorithm behavior. |
| Searching | Available | Linear and binary search over authored integer sequences. |
| Graph traversal | Available | BFS and iterative DFS over weighted or unweighted undirected graphs. |
| Pathfinding | Available | Dijkstra minimum-cost paths with tentative distances and relaxation steps. |
| Trees | Available | Unbalanced binary search tree construction, lookup, preorder, inorder, and postorder traversal. |
| Dynamic programming | Proposed | Reveal subproblems, table updates, and reconstructed solutions. |
| Data structures | Proposed | Visualize stack, queue, and linked-list operations with their changing state. |
| Backtracking | Proposed | Explore choices, dead ends, and undo steps through a maze solver or N-Queens. |
| Recursion and divide-and-conquer | Proposed | Expose call structure and recursive decomposition in algorithms such as merge sort and binary search. |
| Directed graph algorithms | Proposed | Add directed graph authoring with topological sorting and cycle detection. |
| Minimum spanning trees | Proposed | Use weighted graphs to teach Prim's or Kruskal's minimum-total-cost connectivity. |
| String matching | Proposed | Compare naive matching with KMP's prefix-table-guided skips. |

Direct visual graph editing and directed graphs are not currently supported. Proposed families
describe the intended direction and may change as the interaction and trace contracts evolve. Tree
balancing, deletion, rotations, and direct tree editing are not currently supported.

## Project layout

```text
frontend/src/                         UI, playback, adapters, input parsing, and tests
backend/src/main/java/                API contracts, algorithms, traces, and validation
backend/src/test/java/                Backend unit, integration, and contract tests
backend/src/test/resources/contracts/ Versioned API, sorting, graph, and pathfinding fixtures
```

See [AGENTS.md](./AGENTS.md) for repository conventions and contributor guidance.

## Contributing

Keep changes narrowly scoped and include tests for algorithm behavior, contracts, validation, or
UI behavior as appropriate. Before opening a pull request, run the checks for every module changed.
Use short imperative commit subjects, optionally with a Conventional Commit prefix such as
`feat:` or `fix:`.
