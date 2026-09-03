# Algorithm Visualizer

An interactive learning workbench for exploring algorithms one semantic step at a time. The
application builds canonical traces on the backend and plays them in an accessible React interface,
keeping algorithm behavior separate from presentation and playback.

## Current capabilities

- Visualize insertion, selection, bubble, merge, quick, and heap sort.
- Author undirected graphs and traverse the connected component of a selected start node with
  breadth-first search.
- Play, pause, reset, seek, step forward or backward, and adjust playback speed.
- Inspect pseudocode, operation metrics, algorithm state, and explanatory text at every step.
- Follow BFS queue order, traversal order, parent relationships, examined edges, and unreachable
  nodes through both visual and textual representations.
- Receive line-specific graph validation feedback for malformed labels, self-loops, duplicates,
  reversed edges, and graph-size limits.

## Architecture

This repository contains two independently built applications:

```text
frontend/  React 19, TypeScript, Vite, Vitest, Testing Library
backend/   Java 25, Spring Boot 4, Maven, JUnit 5
```

The frontend requests algorithm metadata and traces from the backend. During local development,
Vite proxies `/api` requests to the Spring Boot server at `http://localhost:8080`.

The v2 API uses family-discriminated contracts for sorting and graph traversal. A trace contains
immutable snapshots and typed semantic events, allowing the frontend to render any playback step
without reimplementing the algorithm.

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
appearance and controls BFS neighbor order.

```text
A-C
A-B
"node-one" - C
D
```

Unquoted labels may contain letters, numbers, and underscores. Quote labels that contain hyphens.
A graph may contain at most 12 nodes and 66 unique edges. Self-loops and duplicate edges—including
the same edge written in reverse—are rejected.

Breadth-first search visits only the selected start node's connected component. Nodes outside that
component remain unreached and are reported in declaration order when traversal finishes.

## Roadmap

| Algorithm family | Status | Direction |
| --- | --- | --- |
| Sorting | Available | Expand explanations and compare algorithm behavior. |
| Graph traversal | Available | Expand traversal algorithms and graph-editing tools. |
| Searching | Proposed | Visualize linear and binary search over ordered and unordered data. |
| Pathfinding | Proposed | Show frontier updates, explored nodes, and reconstructed shortest paths. |
| Trees | Proposed | Explore traversal, search, insertion, and balancing operations. |
| Dynamic programming | Proposed | Reveal subproblems, table updates, and reconstructed solutions. |

Proposed families describe the intended direction and may change as the interaction and trace
contracts evolve.

## Project layout

```text
frontend/src/                         UI, playback, adapters, input parsing, and tests
backend/src/main/java/                API contracts, algorithms, traces, and validation
backend/src/test/java/                Backend unit, integration, and contract tests
backend/src/test/resources/contracts/ Versioned API and sorting regression fixtures
```

See [AGENTS.md](./AGENTS.md) for repository conventions and contributor guidance.

## Contributing

Keep changes narrowly scoped and include tests for algorithm behavior, contracts, validation, or
UI behavior as appropriate. Before opening a pull request, run the checks for every module changed.
Use short imperative commit subjects, optionally with a Conventional Commit prefix such as
`feat:` or `fix:`.
