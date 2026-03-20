## Commands
```bash
# From repo root — target a specific workspace:
pnpm --filter @draftkit/core test
pnpm --filter @draftkit/react typecheck
pnpm --filter @draftkit/core lint
pnpm --filter @draftkit/react build

# Run all workspaces:
pnpm -r test
pnpm -r typecheck
pnpm -r lint
```

## Docs & Spec Structure
- `docs/specs/master-spec.md`: canonical requirements (MS-xxx IDs). **Do not hand-edit** Requirements, Decision Log, or Glossary — script-managed.
- `docs/specs/constitution.md`: project principles (TDD, spec-first, monorepo boundaries). Governs all implementation.
- `docs/specs/features/F-xxx-<name>/`: one directory per feature containing `spec.md`, `plan.md`, task files (`T-xxx.md`).
- `docs/specs/compound.md`: reusable learnings captured after each feature completes. Append via `spec-compound`.
- `docs/specs/progress.md` / `progress.json`: auto-generated status board. Do not hand-edit.

## Specflow Workflow
Feature work follows: `spec-define` → `spec-plan` → `spec-tasks` → `spec-implement` → `spec-verify` → `spec-finish` → `spec-compound`
- Every feature spec must link to at least one MS-xxx requirement ID.
- Every task maps to acceptance criteria; every AC maps to a test.
- `spec-verify` must pass before `spec-finish` runs.

## Monorepo Boundaries
- `packages/*` is product code.
- `examples/*` is example/demo only.
- Never implement core product logic only in `examples/*`.

## Package Ownership
- `@draftkit/core`: schema, generation pipeline, validation, serialization (framework-agnostic).
- `@draftkit/react`: renderer, overlay UI, chat shell (React-only).
- `@draftkit/next`: Next.js integration adapters only.
- `examples/playground-next`: manual QA and development playground only.
- UI component source-of-truth is `examples/playground-next/src/components`.
- Do not create a separate package-level UI component library unless explicitly needed later.

## Dependency Direction (must keep)
- `core` must not import `next` or app code.
- `react` may import `core`, but not `next`.
- `next` may import `core` (and optionally `react` wrappers), but no reverse imports.
- `examples/*` can import all packages.

## Implementation Rules
- Start feature work in `core` first, then wire in `react`, then verify in `playground`.
- Keep public package APIs small and explicit from `src/index.ts`.
- Prefer pure functions and typed contracts in `core`.
- Build screen-level UI in `examples`, and keep DraftKit engine/runtime logic in `packages`.
- Always run `lint` and `typecheck` for relevant workspaces before finishing.
- When feasible, perform browser verification (e.g. with `agent-browser`) for user-visible flows.
