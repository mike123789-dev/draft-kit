---
doc_type: plan
feature_id: F-006
last_updated: 2026-03-20
master_spec_id: MS-017
owner: agent
status: Done
title: Storybook Story Extractor
---

# Implementation Plan

## Technical Approach

- Add `packages/draftkit-core/src/story-extractor.ts` with two exported functions: `extractSpecFromStory(content: string): ComponentSpec | null` and `extractRegistryFromStories(filePaths: string[]): Promise<ComponentRegistry>`. No new npm dependencies are introduced — parsing uses the already-installed `@babel/parser` and file I/O uses the Node.js built-in `node:fs/promises`.
- `extractSpecFromStory` parses file content with `@babel/parser` (plugins: `["jsx", "typescript"]`), walks the AST to locate the default-exported meta object literal, and extracts `parameters.draftkit.componentName`, `description`, `importPath`, `argTypes`, and `args`. Any parse error or missing `componentName` causes the function to return `null` rather than throw.
- `allowedProps` is built from `Object.keys(argTypes)` after filtering out keys whose argType value carries an `action` property. `propDefs` is assembled by mapping the `control` field of each remaining argType entry to a `PropDef` type; default values come from `meta.args[key]` when present. Keys with unrecognised `control` values appear in `allowedProps` but are omitted from `propDefs`.
- The returned `ComponentSpec` must never include a `component` key — not even set to `undefined` — so that the F-005 scope-binding pattern can attach runtime component references without conflict.
- `extractRegistryFromStories` reads each file with `readFile` from `node:fs/promises`, calls `extractSpecFromStory`, skips null results and file-read errors silently, and accumulates specs by `name` (last-write-wins for duplicate names).
- Export both functions from `packages/draftkit-core/src/index.ts`. The extractor must import only from `@babel/parser`, `@babel/types`, `node:fs/promises`, and local `./types` — no React, Next.js, or browser APIs may appear anywhere in the file.

## Constitution Check

| Article | Compliant | Note |
|---------|-----------|------|
| Art. 1 — Spec First | [x] | `spec.md` for F-006 exists and is `Ready` before any implementation work begins |
| Art. 2 — TDD | [x] | T-001 and T-002 each require a failing test file committed before the corresponding implementation code; T-003 is an integration test added after both implementation tasks pass |
| Art. 3 — Traceable Delivery | [x] | Every AC maps to a task row; every task row maps to a test command; see Task Index below |
| Art. 4 — Learning Capture | [ ] | compound.md entry to be written by spec-compound after implementation completes |
| Art. 5 — Monorepo Boundaries | [x] | `story-extractor.ts` lives in `packages/draftkit-core`; no framework imports; integration fixture paths reference `examples/` but only in test code, not in the published package |
| Art. 6 — Test Infrastructure Hygiene | [x] | No new packages added; `@babel/parser` is an existing dependency; `node:fs/promises` is a built-in |

## Complexity Tracking

| Concern | Why Needed | Mitigation |
|---------|------------|------------|
| AST walking without a full visitor library | `@babel/traverse` is not a declared dependency; the extractor must walk the AST manually | Scope walking to the default export's object literal is shallow and well-bounded; helper functions keep it readable and testable in isolation |
| `PropDef.default` is typed as `string \| number \| boolean` but `args` values may be arbitrary AST nodes | Literal extraction must handle `StringLiteral`, `NumericLiteral`, `BooleanLiteral`, and `TemplateLiteral` (coerce to string) only; anything else is omitted | Document the omit-on-unknown policy in code comments and cover with a test case |

## Task Index

| ID | Task | AC IDs | Master Spec ID | Output | Test Command | TDD | Detail | Status |
|----|------|--------|----------------|--------|--------------|-----|--------|--------|
| T-001 | Write failing unit tests then implement `extractSpecFromStory` | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 | MS-017 | `packages/draftkit-core/src/story-extractor.ts` (single-file parse function) + `packages/draftkit-core/src/story-extractor.test.ts` (unit suite) | `pnpm --filter @draftkit/core test` | true | [tasks/T-001.md](tasks/T-001.md) | Done |
| T-002 | Write failing unit tests then implement `extractRegistryFromStories` and add public export | AC-7, AC-9 | MS-017 | `packages/draftkit-core/src/story-extractor.ts` (registry function added) + `packages/draftkit-core/src/index.ts` (export added) | `pnpm --filter @draftkit/core test` | true | [tasks/T-002.md](tasks/T-002.md) | Done |
| T-003 | Write integration test against the five real story files | AC-8 | MS-017 | `packages/draftkit-core/src/story-extractor.test.ts` (integration suite appended) | `pnpm --filter @draftkit/core test` | true | [tasks/T-003.md](tasks/T-003.md) | Done |

**Ordering constraint**: T-001 must reach GREEN before T-002 begins. T-002 must reach GREEN before T-003 begins.

## Plan Approval

- **Owner**: agent — 2026-03-20
- **Reviewer**: [pending]

## Compound Capture

[Filled by spec-compound after implementation]
