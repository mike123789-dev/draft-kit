---
doc_type: plan
feature_id: F-003
last_updated: 2026-03-20
master_spec_id: MS-019
owner: agent
status: Done
title: Playground Live Editor — Implementation Plan
---

# Playground Live Editor — Implementation Plan

## Technical Approach

- All changes are in `packages/draftkit-react/src/DraftKitShell.tsx` — no core work needed; the engine (`validateAndRenderJSX`, `buildScope`) was shipped in F-002.
- Replace the `draft: DraftNode | null` state with `jsxResult: PipelineResult | null` — the rendered element or error comes directly from the pipeline, removing the intermediate DraftNode render step.
- Add `editorCode: string` state (current editor text) separate from `committedCode: string` (last Run-applied code) so the editor is decoupled from live preview updates.
- `LiveEditor` from `react-live` requires a `LiveProvider` context; wrap only the editor+preview section in a `LiveProvider` with `disabled` to prevent react-live's own live-update behavior and drive rendering manually through `validateAndRenderJSX` instead.
- Preset buttons call `createMockDraft` with three hardcoded size-appropriate prompts, serialize the result, set `editorCode`, and immediately invoke the pipeline (equivalent to generate + run in one step).
- `renderDraftNode` is removed from the import in `DraftKitShell.tsx`; the `draft` state variable is also removed.

## Constitution Check

| Article | Compliant | Note |
|---------|-----------|------|
| Spec First | ✅ | Spec written before any code |
| Test Driven Development | ✅ | All tasks follow RED-GREEN-REFACTOR |
| Traceable Delivery | ✅ | Every AC maps to a task and test |
| Learning Capture | ✅ | spec-compound runs after verify |
| Monorepo Boundaries | ✅ | Changes stay in `@draftkit/react`; no core changes; no logic in `examples/` |

## Task Index

| ID | Task | AC IDs | Master Spec ID | Output | Test Command | TDD | Detail | Status |
|----|------|--------|----------------|--------|--------------|-----|--------|--------|
| T-001 | Wire validateAndRenderJSX into preview panel | AC-1, AC-2, AC-3, AC-4, AC-12 | MS-019 | `DraftKitShell.tsx` | `pnpm test --filter @draftkit/react` | Passed | [tasks/T-001.md](tasks/T-001.md) | Done |
| T-002 | Add LiveEditor and Run button | AC-5, AC-6, AC-7, AC-8, AC-13 | MS-019 | `DraftKitShell.tsx` | `pnpm test --filter @draftkit/react` | Passed | [tasks/T-002.md](tasks/T-002.md) | Done |
| T-003 | Replace prompt textarea with Mini/Small/Medium presets | AC-9, AC-10, AC-11 | MS-019 | `DraftKitShell.tsx` | `pnpm test --filter @draftkit/react` | Passed | [tasks/T-003.md](tasks/T-003.md) | Done |

## Complexity Tracking

| Concern | Why Needed | Mitigation |
|---------|------------|------------|
| `LiveProvider` wrapping with `disabled` | `LiveEditor` requires `LiveProvider` context but we don't want react-live's auto-render; must suppress it | Set `disabled` prop on `LiveProvider`; drive preview exclusively through `validateAndRenderJSX` |
| DraftNode state removal | `draft` state and `renderDraftNode` are removed; existing F-001 unit tests must still pass | F-001 tests are on `render-draft.tsx` directly — not on `DraftKitShell`; safe to remove from shell |

## Plan Approval

- **Owner**: agent — 2026-03-20
- **Reviewer**: —

## Compound Capture

[Filled by spec-compound after implementation]
