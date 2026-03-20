---
doc_type: plan
feature_id: F-005
last_updated: 2026-03-20
master_spec_id: MS-020
owner: agent
status: Done
title: Automatic Scope Binding from Component Registry
---

# Implementation Plan

## Technical Approach

- Add `component?: unknown` to `ComponentSpec` in `@draftkit/core` — a purely additive type change that keeps `core` framework-agnostic; no React imports are introduced.
- Add `buildScopeFromRegistry(registry: ComponentRegistry): Record<string, unknown>` to `jsx-renderer.tsx` — iterates registry entries, collects those whose `component` field is non-nullish using `entry.name` as the scope key, then merges with `PRIMITIVE_SCOPE` (registry entries win on name collision); keep `buildScope` as an unexported internal utility so existing F-002 tests that import it directly continue to pass.
- Update `validateAndRenderJSX` in `jsx-pipeline.tsx` to call `buildScopeFromRegistry(registry)` in place of `buildScope(additionalScope)` and drop the `additionalScope` parameter; this is an intentional breaking change to the public API per AC-4.
- Remove the `components` prop from `DraftKitShellProps` and the `DraftKitShell` function signature in `DraftKitShell.tsx`; update both `validateAndRenderJSX` call sites to `(code, registry)`.
- In `examples/playground-next/src/app/page.tsx`, delete the standalone `playgroundComponents` map and build a `playgroundRegistry` that extends `defaultRegistry` with `component` references for all previously listed components (Badge, Button, Card sub-components, Input, Label, Separator, Tabs sub-components, and the Text stub); pass `registry={playgroundRegistry}` to `DraftKitShell` with no `components` prop.
- Export `buildScopeFromRegistry` from `@draftkit/react/src/index.ts` as the new primary public scope API; drop `buildScope` from the public export.

## Constitution Check

| Article                             | Compliant | Note                                                                                                                                                                                                                 |
| ----------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Art. 1: Spec First                  | [x]       | Spec at `docs/specs/features/F-005-automatic-scope-binding/spec.md` is approved and marked Ready before any implementation task begins.                                                                              |
| Art. 2: TDD                         | [x]       | All four tasks require a failing test written before the implementation code. `buildScopeFromRegistry` unit tests (T-002) cover all edge case rows from the spec.                                                    |
| Art. 3: Traceable Delivery          | [x]       | Every AC maps to at least one task row; every task row maps to at least one AC.                                                                                                                                      |
| Art. 4: Learning Capture            | [x]       | compound.md entry required after implementation; spec-compound to be run on feature close.                                                                                                                           |
| Art. 5: Monorepo Boundaries         | [x]       | `component?: unknown` uses `unknown` — no React type in `core`. All React-specific scope logic remains in `@draftkit/react`. `examples/playground-next` is the only consumer of both packages as per boundary rules. |
| Art. 6: Test Infrastructure Hygiene | [x]       | No new packages introduced. Existing `pretest` scripts for `draftkit-core` and `draftkit-react` clean compiled artifacts before each run; no new build config changes needed.                                        |

## Complexity Tracking

| Concern                                       | Why Needed                                                                                                                   | Mitigation                                                                                                                                                                          |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Breaking API change to `validateAndRenderJSX` | Dropping `additionalScope` is a public API break; any caller other than `DraftKitShell` would fail silently at compile time. | TypeScript enforces arity; `pnpm typecheck` across all workspaces in T-003 will surface any remaining callers.                                                                      |
| `buildScope` demotion                         | F-002 tests may import `buildScope` directly from the public export. Removing it from `index.ts` would break those tests.    | Keep `buildScope` as a non-exported module-internal function in `jsx-renderer.tsx`; remove only the `index.ts` re-export. Confirm no F-002 test imports it from the package barrel. |

## Task Index

| ID | Task | AC IDs | Master Spec ID | Output | Test Command | TDD | Detail | Status |
|----|------|--------|----------------|--------|--------------|-----|--------|--------|
| T-001 | Add `component?: unknown` to `ComponentSpec` | AC-1 | MS-020 | `packages/draftkit-core/src/types.ts` modified | `pnpm --filter @draftkit/core test:unit` | Done | [tasks/T-001.md](tasks/T-001.md) | Done |
| T-002 | Add `buildScopeFromRegistry` and update pipeline | AC-2, AC-3, AC-4, AC-8, AC-9 | MS-020 | `jsx-renderer.tsx` + `jsx-pipeline.tsx` + `index.ts` in `@draftkit/react` modified | `pnpm --filter @draftkit/react test:unit` | Done | [tasks/T-002.md](tasks/T-002.md) | Done |
| T-003 | Remove `components` prop from `DraftKitShell` | AC-5, AC-6 | MS-020 | `DraftKitShell.tsx` modified; lint + typecheck pass | `pnpm --filter @draftkit/react test:unit && pnpm --filter @draftkit/react typecheck` | Done | [tasks/T-003.md](tasks/T-003.md) | Done |
| T-004 | Consolidate playground registry | AC-7 | MS-020 | `examples/playground-next/src/app/page.tsx` modified | `pnpm --filter playground-next lint && pnpm --filter playground-next typecheck` | Done | [tasks/T-004.md](tasks/T-004.md) | Done |

### Dependency Order

T-001 must complete before T-002 (pipeline needs the updated `ComponentSpec` type).
T-002 must complete before T-003 (`DraftKitShell` calls the updated `validateAndRenderJSX` signature).
T-003 must complete before T-004 (playground must not pass the now-removed `components` prop).

### Quality Gates (all must pass before feature is marked Done)

```
pnpm --filter @draftkit/core typecheck
pnpm --filter @draftkit/core test:unit
pnpm --filter @draftkit/react typecheck
pnpm --filter @draftkit/react test:unit
pnpm --filter playground-next lint
pnpm --filter playground-next typecheck
```

## Plan Approval

- **Owner**: agent - 2026-03-20
- **Reviewer**: [pending]

## Compound Capture

[Filled by spec-compound after implementation]
