# 01: Bidirectional topology and DLL endpoint additions

**What to build:** Learners can select Doubly Linked List, author `prepend("label")` and `append("label")` through synchronized structured and text surfaces, and replay a backend-owned immutable topology trace. The lesson visibly establishes and maintains `head`, `tail`, `next`, and `prev` relationships for empty-to-one and one-to-many additions without traversing existing nodes.

**Blocked by:** None (can start immediately).

**Status:** complete

- [ ] The v2 Data Structures catalog, typed request/trace contract, independent draft, command language, and capability-driven workbench expose Doubly Linked List without changing existing structure contracts.
- [ ] Prepend and append traces show allocation, all relevant bidirectional-link assignments, endpoint movement, and committed topology as immutable contiguous semantic snapshots; both operations have constant-time structural behavior with no inspection event.
- [ ] The visualizer and textual equivalent distinguish `head`, `tail`, `next`, and `prev`, including the empty and one-node invariants; results report final topology, size, endpoints, and operation outcomes.
- [ ] Backend, contract, parser, component, and workbench tests cover valid bounds, duplicate value occurrences, synchronized authoring, empty-to-one and one-to-many additions, stable identity, accessibility, and existing-family compatibility.
