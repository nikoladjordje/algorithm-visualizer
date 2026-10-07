# 03: Synchronize structured and text sequence authoring

**What to build:** A learner can author the same Stack or Queue Operation sequence through either
the Structured operation editor or a line-based Text command language, confident that both surfaces
represent one valid sequence and malformed text never destroys prior valid work.

**Blocked by:** 01 — Add Stack operation-sequence learning path; 02 — Add Queue operation-sequence learning path.

**Status:** completed

- [x] One quoted function-style command per line maps to every valid Stack and Queue operation,
  including text labels that need standard escaping, and valid changes synchronize in both
  directions with operation rows.
- [x] Syntax, missing-label, bounds, and structure-incompatible commands report immediate,
  line-specific, actionable feedback while the last valid Operation sequence remains available for
  playback.
- [x] Keyboard-operable authoring and external-behavior tests cover synchronization, invalid text,
  editing from either surface, and trace submission of only typed canonical operations.
