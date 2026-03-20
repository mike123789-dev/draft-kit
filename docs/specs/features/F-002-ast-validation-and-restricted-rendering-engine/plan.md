---
doc_type: plan
feature_id: F-002
last_updated: 2026-03-20
master_spec_id: MS-011
owner: agent
status: Ready
title: Implementation Plan
---

# Implementation Plan

## Technical Approach

- AST validation lives entirely in `@draftkit/core/src/jsx-validate.ts`: exports `validateJSX(jsxString, registry)` returning `{ ok, issues }` — zero React/DOM imports.
- `@babel/parser` (already installed) handles JSX parsing with `{ plugins: ["jsx"] }`; location data from parse errors provides line/col for AC-1.
- Forbidden patterns (globals, hooks, async, import/export) are defined as a `FORBIDDEN_PATTERNS` data structure — each entry specifies node types to detect and error message template — extending the list requires no code changes (spec constraint).
- Rendering engine lives in `@draftkit/react/src/jsx-renderer.tsx`: uses react-live's `LiveProvider` + `LivePreview` with a `scope` object built from registry + layout primitives; a pre-render scope check surfaces missing-component errors explicitly (AC-8).
- Pipeline function `validateAndRenderJSX(jsxString, registry)` lives in `@draftkit/react` (combines core validation with React rendering); returns renderable element or `{ ok: false, issues }` — never throws.
- `validateDraft()` from F-001 is untouched; `validateJSX` is an additional named export from `@draftkit/core`.

## Constitution Check

| Article | Compliant | Note |
|---------|-----------|------|
| spec-first | ✅ | Spec exists before implementation. |
| test-driven-development | ✅ | All tasks follow RED-GREEN-REFACTOR. |
| traceable-delivery | ✅ | Every task maps to AC IDs; every AC maps to a test. |
| learning-capture | ✅ | Compound entry planned after verify. |
| monorepo-boundaries-dependency-direction | ✅ | Validation in `core` (no React imports); rendering in `react`; pipeline in `react` imports `core`. |

## Task Index

| ID | Task | AC IDs | Master Spec ID | Output | Test Command | TDD | Detail | Status |
|----|------|--------|----------------|--------|-------------|-----|--------|--------|
| T-001 | JSX string parser and pre-checks (size limit, empty/whitespace, syntax error with line/col) | AC-1 | MS-011 | `packages/draftkit-core/src/jsx-validate.ts` | `pnpm test` | ✅ | [tasks/T-001.md](tasks/T-001.md) | Done |
| T-002 | Forbidden pattern AST traversal — data-driven config for imports/exports, globals, hooks, async | AC-2, AC-3, AC-5, AC-6 | MS-011 | `packages/draftkit-core/src/jsx-validate.ts` | `pnpm test` | ✅ | [tasks/T-002.md](tasks/T-002.md) | Done |
| T-003 | Registry-scoped component name validation against registry + layout primitives | AC-4 | MS-011 | `packages/draftkit-core/src/jsx-validate.ts` | `pnpm test` | ✅ | [tasks/T-003.md](tasks/T-003.md) | Done |
| T-004 | react-live rendering engine with scoped component whitelist and explicit missing-component error | AC-7, AC-8 | MS-011 | `packages/draftkit-react/src/jsx-renderer.tsx` | `pnpm test` | ✅ | [tasks/T-004.md](tasks/T-004.md) | Done |
| T-005 | Pipeline function validateAndRenderJSX + AC-10 backward compat verification | AC-9, AC-10 | MS-011 | `packages/draftkit-react/src/jsx-renderer.tsx`, `packages/draftkit-core/src/index.ts` | `pnpm test` | ✅ | [tasks/T-005.md](tasks/T-005.md) | Done |

## Complexity Tracking

| Concern | Why Needed | Mitigation |
|---------|------------|------------|
| @babel/parser AST node shape | Must traverse JSXOpeningElement, Identifier, ImportDeclaration etc. correctly | Reference babel AST spec during T-001; test with representative fixtures |
| react-live uses Function constructor internally | react-live's own internals would trip our forbidden-global check if applied to the wrong scope | Forbidden-pattern check applies to user-supplied JSX string only, not react-live internals |
| Missing-component error in react-live | react-live renders `undefined` silently when scope entry is missing | Pre-check scope keys against JSX component names before calling LiveProvider |

## Plan Approval

- **Owner**: [Name] - [Date]
- **Reviewer**: [Name] - [Date]

## Compound Capture

[Filled by spec-compound after implementation]
