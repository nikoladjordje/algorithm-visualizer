# 01: BST preorder learning slice

**What to build:** Learners can select Binary Search Tree, enter a unique signed-integer insertion sequence, and replay canonical construction followed by preorder traversal in a deterministic rooted tree view. The catalog and typed `TREE` contracts are introduced additively, with independent tree drafts, playback, explanations, results, and focused backend/frontend coverage.

**Blocked by:** None (can start immediately).

**Status:** completed

- [x] The v2 catalog discovers `binary-search-tree` as a `TREE` family algorithm with bounded, unique signed-32-bit insertion values, and existing family contracts remain unchanged.
- [x] A valid preorder request produces immutable, contiguous construction and traversal snapshots, including stable node relationships, attachments, visits, result data, and summary metrics within the established trace limit.
- [x] The workbench provides a retained tree draft and deterministic rooted SVG and textual tree representations for construction and preorder playback, with shared playback controls and event explanations.
- [x] Backend HTTP/contract tests, focused BST tests, and frontend workbench tests cover valid construction, preorder order, validation, deterministic state, and existing-family regression.
