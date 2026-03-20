---
doc_type: plan
feature_id: F-001
last_updated: 2026-03-20
master_spec_id: "MS-009"
owner: agent
status: Done
title: Implementation Plan
---

# Implementation Plan

## Technical Approach

- Enrich `ComponentSpec` in `@draftkit/core` with typed prop definitions (type, default, enum values) and children constraints; derive layout primitive specs from this enriched schema.
- Extend `validateDraft` with two new structural rules: nesting-depth check (layout primitives only, limit 4) and raw-HTML-element rejection — both in `@draftkit/core`, framework-agnostic.
- Update `@draftkit/react` primitives to read declared props (gap, columns, align, justify, wrap, maxWidth, size) and map them to inline styles, replacing current hardcoded defaults.
- Work order follows monorepo rule: core schema first (T-001), core validation (T-002), react rendering (T-003). All tasks use TDD with `pnpm test`.

## Constitution Check

| Article                                  | Compliant | Note                                                       |
| ---------------------------------------- | --------- | ---------------------------------------------------------- |
| spec-first                               | ✅         | Spec exists before implementation planning.                |
| test-driven-development                  | ✅         | Tasks use test commands and TDD is enforced in task files. |
| traceable-delivery                       | ✅         | Planned approach follows this article.                     |
| learning-capture                         | ✅         | Planned approach follows this article.                     |
| monorepo-boundaries-dependency-direction | ✅         | Planned approach follows this article.                     |

## Task Index

| ID | Task | AC IDs | Master Spec ID | Output | Test Command | TDD | Detail | Status |
|----|------|--------|----------------|--------|-------------|-----|--------|--------|
| T-001 | Enrich ComponentSpec schema and define typed layout primitive specs | AC-1, AC-9 | MS-009 | `packages/draftkit-core/src/types.ts`, `packages/draftkit-core/src/layout.ts` | `pnpm test` | ✅ | [tasks/T-001.md](tasks/T-001.md) | Done |
| T-002 | Add structural validation rules (nesting depth, raw HTML, children constraints, enum/range checks) | AC-7, AC-8 | MS-016 | `packages/draftkit-core/src/validate.ts` | `pnpm test` | ✅ | [tasks/T-002.md](tasks/T-002.md) | Done |
| T-003 | Wire layout primitive props in React renderer (gap, columns, align, justify, wrap, maxWidth, size) | AC-2, AC-3, AC-4, AC-5, AC-6, AC-10 | MS-009, MS-016 | `packages/draftkit-react/src/primitives.tsx` | `pnpm test` | ✅ | [tasks/T-003.md](tasks/T-003.md) | Done |

## Plan Approval

- **Owner**: [Name] - [Date]
- **Reviewer**: [Name] - [Date]

## Compound Capture

[Filled by spec-compound after implementation]
