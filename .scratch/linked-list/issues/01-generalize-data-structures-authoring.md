# 01: Generalize Data Structures authoring

**What to build:** Stack and Queue continue to provide their established learning paths through a capability-driven Data Structures authoring seam rather than binary Stack/Queue branching. Learners can add, edit, remove, and reorder operation rows while synchronized text commands, validation, independent drafts, confirmation before discarding a non-empty draft, and playback remain reliable.

**Blocked by:** None (can start immediately).

**Status:** completed

- [x] Stack and Queue retain their existing catalog selection, typed trace submission, semantic playback, and learner-visible behavior after the authoring seam is generalized.
- [x] The structured operation editor supports add, edit, remove, and reorder for a selected structure; valid rows and text commands remain synchronized, while malformed text retains the last valid operation sequence with line-specific feedback.
- [x] Each structure retains an independent draft, and moving away from a non-empty active draft confirms before discarding it without translating operations.
- [x] Focused parser, component, and workbench coverage protects the generalized external behavior and existing accessibility expectations.

## Answer

Generalized Stack and Queue authoring behind one capability registry and shared authoring component. The workbench now resolves commands, validation, trace submission, learning content, and visualizers through the selected capability; operation rows can be added, edited, removed, and reordered while command text stays synchronized.
