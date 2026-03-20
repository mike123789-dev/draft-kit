---
doc_type: plan
feature_id: F-004
last_updated: 2026-03-20
master_spec_id: MS-015
owner: agent
status: Draft
title: "Export: Copy JSX + Single-File Component"
---

# Implementation Plan

## Overview

F-004 closes the gap between the existing bare-JSX copy action (MS-005) and a fully usable single-file component export (MS-015). The work is additive across two packages: `@draftkit/core` gains a new serializer function and a richer type; `@draftkit/react` gains draft state tracking and updated copy behavior. No existing public API signatures are removed or changed.

## Technical Approach

- Add the optional `importPath?: string` field to `ComponentSpec` in `packages/draftkit-core/src/types.ts`; all existing registry entries remain valid without changes because the field is optional.
- Populate `importPath: "@draftkit/react"` on all 8 primitives in `defaultRegistry` (`packages/draftkit-core/src/layout.ts`) so the new serializer can generate correct import statements out of the box.
- Implement `serializeDraftToComponent(node: DraftNode, registry: ComponentRegistry): string` in `packages/draftkit-core/src/serialize.ts` using a recursive walk to collect unique component types, group them by `importPath`, sort names alphabetically within each group, sort groups by path, then prepend `import React from "react"` and wrap the existing `serializeDraftToJsx` output — keeping the existing functions untouched.
- Export `serializeDraftToComponent` from `packages/draftkit-core/src/index.ts` alongside existing exports; no other public API surface changes.
- In `packages/draftkit-react/src/DraftKitShell.tsx`, add `draft: DraftNode | null` to component state; set it in `handlePreset` (from the `createMockDraft` result already in scope) and clear it to `null` on reset; update `handleCopyCode` to prefer `serializeDraftToComponent(draft, registry)` when `draft` is non-null, fall back to `editorCode`, and disable the button when both are absent.
- Cover the new serializer with unit tests in `packages/draftkit-core/src/serialize.test.ts`: deduplication, alphabetical sorting, no-`importPath` exclusion, empty-registry case, single-node tree, and deeply nested tree; run full `pnpm test` to confirm no regressions in existing tests.

## Constitution Check

| Article | Compliant | Note |
|---------|-----------|------|
| spec-first | Yes | Spec (F-004/spec.md) exists and is in Draft status before this plan. |
| test-driven-development | Yes | T-002 and T-004 carry explicit test commands; T-001 and T-003 are covered by the suite run in T-004. |
| traceable-delivery | Yes | Each task maps to specific AC IDs and a master spec ID. |
| learning-capture | Yes | Compound capture section reserved for post-implementation fill. |
| monorepo-boundaries-dependency-direction | Yes | New serializer stays in `core` with no framework imports; `react` imports from `core` only. |

## Task Index

| ID | Task | AC IDs | Master Spec ID | Output | Test Command | TDD | Detail | Status |
|----|------|--------|----------------|--------|--------------|-----|--------|--------|
| T-001 | Extend `ComponentSpec` with optional `importPath` field and populate it on all 8 `defaultRegistry` primitives | AC-1, AC-2 | MS-015 | `packages/draftkit-core/src/types.ts`, `packages/draftkit-core/src/layout.ts` | `pnpm --filter @draftkit/core test` | Yes | [tasks/T-001.md](tasks/T-001.md) | Done |
| T-002 | Implement `serializeDraftToComponent` in `serialize.ts` and export from `index.ts` | AC-3, AC-4, AC-5, AC-6 | MS-015 | `packages/draftkit-core/src/serialize.ts`, `packages/draftkit-core/src/index.ts` | `pnpm --filter @draftkit/core test` | Yes | [tasks/T-002.md](tasks/T-002.md) | Done |
| T-003 | Update `DraftKitShell` to store `DraftNode` state and use `serializeDraftToComponent` in copy handler | AC-7, AC-8 | MS-005, MS-015 | `packages/draftkit-react/src/DraftKitShell.tsx` | `pnpm --filter @draftkit/react test` | Yes | [tasks/T-003.md](tasks/T-003.md) | Done |
| T-004 | Write unit tests for `serializeDraftToComponent` and run full suite to confirm no regressions | AC-9 | MS-015 | `packages/draftkit-core/src/serialize.test.ts` | `pnpm test` | Yes | [tasks/T-004.md](tasks/T-004.md) | Done |

## Verification Strategy

### Unit tests (`serialize.test.ts`)

Each of the following scenarios must have a dedicated `it` block:

| Scenario | AC covered |
|----------|-----------|
| Single component type used multiple times in tree — output contains exactly one named import entry | AC-5 |
| Two component types from the same `importPath` — single import statement with names sorted alphabetically | AC-4, AC-5 |
| Two component types from different `importPath` values — two import statements sorted by path | AC-4 |
| Component type present in tree but absent from registry — excluded from imports, present in JSX body | AC-6 |
| Component type present in registry but with no `importPath` — excluded from imports, present in JSX body | AC-6 |
| Registry is an empty object — only `import React from "react"` emitted | AC-4, AC-6 |
| Single leaf node with no children — one import for that component; JSX body is a single element | AC-4, AC-5 |
| Deeply nested tree (5+ levels) — all types at all depths collected; no stack overflow | AC-5 |
| Output string always begins with `import React from "react"` as the very first line | AC-4 |
| Output contains `export default function DraftOutput()` wrapper | AC-4 |

### Shell behavior tests (`DraftKitShell.test.tsx`)

- When a preset is selected, `draft` state becomes non-null (verifiable via mock of `createMockDraft`).
- Activating "Copy JSX" after a preset select calls `navigator.clipboard.writeText` with the output of `serializeDraftToComponent`, not `editorCode` alone.
- When `draft` is null and `editorCode` is non-empty, "Copy JSX" writes `editorCode` to the clipboard (existing fallback preserved).
- "Copy JSX" button has `disabled` attribute when both `draft` and `editorCode` are absent.

### Regression guard

- Run `pnpm test` at root after T-004 to confirm existing `serializeDraftToJsx` and `serializeDraftToJsxExpression` tests still pass.
- Run `pnpm --filter @draftkit/core typecheck` and `pnpm --filter @draftkit/react typecheck` to confirm no type errors introduced.
- Run `pnpm lint` across affected packages.

## Plan Approval

- **Owner**: [Name] - [Date]
- **Reviewer**: [Name] - [Date]

## Compound Capture

[Filled by spec-compound after implementation]
