# Workbench User Guide

Select an algorithm, edit its input, then choose **Visualize**. Switching algorithms stops
playback and clears the current trace while retaining separate sorting and graph drafts in memory.
The `?algorithm=` URL query selects an algorithm, but inputs are never placed in the URL.

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
- First appearance from top to bottom and left to right determines node order. BFS uses this order
  for neighbors even when edges were entered in another order.
- Self-loops, repeated nodes, duplicate or reversed edges, malformed lines, and graphs over 12
  nodes or 66 edges are rejected. Duplicate-edge errors identify both declaration lines.
- Removing the selected start chooses the first remaining node; no valid graph clears it.

Choose **Branching**, **Cycle**, or **Disconnected** to populate a fixed example without running it.
BFS visits only the selected start component. Other nodes remain unreached and appear in declaration
order at completion.

## Reading BFS

The circular layout is deterministic. Labels, symbols, border weight, and dash patterns distinguish
node states without color. The transient examined edge is heavy and dashed; persistent BFS-tree
edges are heavy and solid. Queue, traversal order, every node state, parents, examined edge, and
completion-time unreachable nodes also appear below the SVG and in its accessible description.

Loading, step explanations, and completion are announced through a live region. Standard controls
support keyboard operation and visible focus. When the operating system requests reduced motion,
graph, chart, button, and loading transitions and animations are effectively removed.

## Versioned learning material

Sorting pseudocode mappings and explanations are in `frontend/src/adapters.ts`; BFS mappings and
explanations are in `frontend/src/App.tsx`; fixed graph presets are in
`frontend/src/graphPresets.ts`. Contract schemas and sorting traces are under
`backend/src/test/resources/contracts/v2/`. BFS acceptance behavior is locked by backend graph and
API tests and the normative `docs/breadth-first-graph-traversal-prd.md`.
