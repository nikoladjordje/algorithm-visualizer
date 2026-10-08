# Product Requirements: Stack and Queue Foundations

Status: ready-for-agent

## Problem Statement

Learners can currently inspect canonical traces for algorithms, but cannot yet learn how common
linear data structures change as operations are applied over time. A Stack and a Queue can appear
superficially similar as collections of values, yet their distinct access rules—last-in, first-out
and first-in, first-out—are the essential lesson. Learners need to author a reproducible sequence,
replay its meaningful state changes, and understand valid empty-structure outcomes without
mistaking them for input errors.

## Solution

Introduce the first independently shippable milestone in the Data Structures epic: Stack and Queue
foundations. A learner selects exactly one structure, authors an Operation sequence beginning from
an empty structure, and replays its canonical semantic trace in the existing workbench.

The learner can author the same sequence through a Structured operation editor or a synchronized
Text command language. Stack sequences permit push, pop, and peek; Queue sequences permit enqueue,
dequeue, and peek. The workbench shows a Stack vertically at its Top and a Queue horizontally from
Front to rear, explaining each Data-structure semantic step and its final state.

## User Stories

1. As a learner, I want to choose Stack or Queue before authoring, so that each Operation sequence has one clear access rule.
2. As a learner, I want each new Operation sequence to begin with an empty structure, so that I can see exactly which operation introduced every Value occurrence.
3. As a learner, I want to add Stack operation rows for push, pop, and peek, so that I can explore last-in, first-out behavior.
4. As a learner, I want to add Queue operation rows for enqueue, dequeue, and peek, so that I can explore first-in, first-out behavior.
5. As a learner, I want push and enqueue to accept short text labels, so that numeric magnitude does not distract from access order.
6. As a learner, I want to add, edit, reorder, and remove operations in a Structured operation editor, so that I can construct a sequence without learning a command syntax.
7. As a learner, I want to author the same sequence as one Text command language command per line, so that I can create and revise a longer scenario quickly.
8. As a learner, I want valid text commands to synchronize immediately into the Structured operation editor, so that both authoring surfaces describe one Operation sequence.
9. As a learner, I want edits in the Structured operation editor to regenerate the command text, so that neither authoring surface becomes stale.
10. As a learner, I want malformed commands to identify their line and reason immediately, so that I can correct syntax or a structure-incompatible operation before playback.
11. As a learner, I want malformed text to retain the last valid synchronized Operation sequence, so that one typing mistake does not erase usable work.
12. As a learner, I want a pop, dequeue, or peek on an empty structure to appear as an Empty-structure outcome, so that I understand it is a completed no-op rather than a validation failure.
13. As a learner, I want playback to continue after an Empty-structure outcome, so that later operations can demonstrate recovery.
14. As a learner, I want repeated labels to be accepted, so that the workbench models normal Stack and Queue behavior rather than imposing artificial uniqueness.
15. As a learner, I want equal labels to receive Occurrence badges only when they coexist, so that I can distinguish their separate Value occurrences without cluttering ordinary examples.
16. As a learner, I want playback to identify the current command and its affected access end or value before committing state, so that each operation remains understandable step by step.
17. As a learner, I want the Stack display to make the Top visible and fixed, so that its access rule is immediately legible.
18. As a learner, I want the Queue display to make its Front and rear visible and fixed, so that addition and removal locations remain clear.
19. As a keyboard or assistive-technology user, I want both authoring surfaces, sequence controls, visual state, and outcomes to have clear labels and textual equivalents, so that I can learn without relying on color, animation, or pointer input.
20. As a learner, I want changing from Stack to Queue or vice versa to require confirmation when I have a draft, so that I do not lose an Operation sequence accidentally.
21. As a learner, I want a confirmed Structure change to start a new empty sequence, so that Stack and Queue sessions never silently translate their different access rules.
22. As a learner, I want the catalog and URL-driven algorithm selection to recognize the new structures alongside existing workbench families, so that they behave consistently with the rest of the product.
23. As a maintainer, I want a canonical backend trace for every valid sequence, so that all clients replay the same states and semantic explanations.
24. As a maintainer, I want bounded input and trace validation, so that the learning UI stays responsive and the service remains protected from oversized requests.

## Implementation Decisions

### Scope and progression

- Data Structures is one major product epic delivered through small, independently shippable
  milestones. This specification covers only its first milestone: Stack and Queue foundations.
- Later Data Structures milestones may cover linked lists, deques and doubly linked lists, heaps
  and priority queues, hash tables, richer tree structures, and specialized structures. They do
  not expand this delivery.
- Stack and Queue are distinct selectable algorithms in a dedicated Data Structures API family.
  Each trace represents exactly one selected structure.

### Authoring model

- Every Operation sequence starts from an empty structure and contains from 1 through 50
  operations.
- A Structure value is a text label from 1 through 40 characters. Labels are values of identity
  only: no ordering, arithmetic, or priority semantics apply.
- Duplicate labels are valid. Every insertion creates a distinct Value occurrence with a stable
  identity. When equal labels coexist, the UI adds stable conditional Occurrence badges in visual
  and accessible descriptions; unique labels remain uncluttered.
- The Structured operation editor and Text command language are synchronized views of one
  canonical client-side sequence. Either view updates the other only after producing a valid
  sequence; malformed command text leaves the last valid sequence intact.
- The Text command language has one function-style command per line. Stack accepts
  `push("label")`, `pop()`, and `peek()`; Queue accepts `enqueue("label")`, `dequeue()`, and
  `peek()`. Quoted labels use standard JSON-style escaping, so quote and backslash characters
  remain representable without ambiguity.
- The parser reports syntax, missing-label, out-of-range, and structure-incompatible command
  errors immediately with the command line and an actionable explanation. It never silently drops
  commands.
- A Structure change with a non-empty draft requires confirmation. On confirmation it clears the
  draft and creates a new empty sequence; no operation translation is attempted. Changing an empty
  draft requires no confirmation.

### Canonical trace and v2 contract

- The backend accepts the selected structure and its ordered, typed operation list; it does not
  receive the Text command language itself. Text parsing and synchronization are client authoring
  concerns.
- The API catalog exposes constraints for the Data Structures family, including the selected
  structure's permitted operations, the 1–50 operation bound, the 1–40-character label bound,
  and empty initial state.
- A trace returns immutable snapshots and typed semantic events consistent with other v2 learning
  families. Each event identifies the operation's position in the sequence, the affected Value
  occurrence when relevant, an access end when relevant, and its resulting state.
- Each operation produces learner-facing semantic stages: command selection, affected end/value
  exposure, and committed state. An Empty-structure outcome replaces a removal or read commit
  when no Value occurrence exists; it leaves the state unchanged and execution continues.
- The result states the completed structure, final ordered Value occurrences, and the outcomes of
  the authored operations. Pseudocode, explanatory text, and accessible announcements derive from
  the same event semantics rather than recomputing behavior in the frontend.
- Trace limits remain enforced by the API in addition to authoring limits.

### Workbench experience

- The workbench reuses its catalog-driven family selection, cancellation/stale-response handling,
  playback controls, timeline, learning panels, and live completion announcements.
- A dedicated authoring component owns the canonical parsed Operation sequence, text draft,
  row-editor interactions, validation feedback, and Structure-change confirmation. A dedicated
  visualizer renders the typed trace state.
- The Stack visualizer uses a fixed vertical layout whose accessible end is the Top. The Queue
  visualizer uses a fixed horizontal layout with Front as its removal end and rear as its addition
  end. These layout choices are fixed rather than learner-configurable in this milestone.
- Visual status always has non-color cues and a textual or accessible equivalent. The active
  command, current semantic stage, affected access end, affected Value occurrence, and
  Empty-structure outcome are exposed to screen readers. Reduced-motion preferences are honored.
- The first delivery deliberately teaches abstract structure behavior. It does not visualize array
  slots, capacity, resizing, indices, pointers, memory, or other implementation mechanics.

### Design record

- The operation-sequence trace boundary follows ADR 0009: the workbench traces a learner-authored
  sequence against one evolving state instead of a single operation or a live mutable session.

## Testing Decisions

- The primary acceptance seam is the v2 Data Structures trace contract: catalog discovery, trace
  request, immutable semantic events and snapshots, result, validation, and workbench playback
  agree end to end. This is the highest existing seam and avoids parallel frontend algorithm
  logic.
- Backend behavior tests verify Stack and Queue ordering; every permitted operation; Empty-
  structure outcomes that continue execution; repeated labels and stable Value occurrence
  identity; result integrity; input bounds; operation-family mismatch; and trace-limit behavior.
- Controller and contract-fixture tests verify catalog constraints, typed request validation, v2
  response shape, structured error details, and compatibility with the existing catalog.
- Frontend component tests verify both authoring surfaces synchronize valid sequences, malformed
  command text retains the last valid sequence and reports the correct line, and Structure-change
  confirmation clears only a confirmed non-empty draft.
- Workbench integration tests verify catalog selection, typed request submission, cancellation and
  stale-response protection, playback controls, semantic explanations, visual ordering, conditional
  Occurrence badges, Empty-structure announcements, keyboard operation, and accessible text
  equivalents.
- Tests assert externally observable contract and learner behavior—not reducer internals, DOM
  implementation details, or incidental animation timing. Existing v2 contract, algorithm,
  component, and workbench tests provide the relevant prior-art patterns.

## Out of Scope

- Linked lists, node links, pointer rewiring, direct node editing, and linked-list operations.
- Deques, doubly linked lists, circular queues, bounded capacity, overflow, underflow exceptions,
  array resizing, and implementation-specific index mechanics.
- Heaps, priority queues, hash tables, tries, union-find, and new tree structures or BST mutation.
- Mixing Stack and Queue operations in one Operation sequence; simultaneous side-by-side
  structures; automatic operation translation between structures; and live persistent mutation.
- Text-command import/export formats beyond the synchronized editor, saved/shared sequences, and
  configurable visual orientations.
- Direct visualization of memory allocation, implementation storage, or performance comparisons.

## Further Notes

- This milestone establishes the Data Structures epic without committing later structures to the
  same request, event, or visual contract where their domain language differs.
- The existing Stack and Queue terms share the workbench's learning vocabulary. In particular, an
  Empty-structure outcome is a successful learner-visible no-op, not a validation error.
