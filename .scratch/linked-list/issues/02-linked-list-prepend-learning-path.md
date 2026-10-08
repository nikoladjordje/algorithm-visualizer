# 02: Add the Linked List prepend learning path

**What to build:** A learner can select Linked List, author a bounded sequence containing `prepend("label")` through either synchronized authoring surface, and replay a canonical backend trace from an empty singly linked list. The learner sees allocation, initialization of the new node's `next` link, and `head` movement as immutable, accessible topology states.

**Blocked by:** 01 — Generalize Data Structures authoring.

**Status:** completed

- [x] The Data Structures catalog, typed request validation, result, and trace contract expose Linked List and its dedicated operation model without weakening Stack or Queue contracts.
- [x] A valid prepend creates a distinct node occurrence, produces semantic allocation/link/head steps with complete immutable topology snapshots, and preserves duplicate label identity.
- [x] The workbench accepts and serializes `prepend("label")`, submits only typed canonical operations, and renders `head`, node identity, `next`, and `null` with textual topology narration and shared playback.
- [x] Backend behavior, controller/contract, component, and workbench integration tests prove the complete prepend path and 1–50-operation / 1–40-character bounds.
