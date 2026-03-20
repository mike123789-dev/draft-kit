<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Monorepo Boundaries
- `packages/*` is product code.
- `apps/*` is example/demo only.
- Never implement core product logic only in `apps/*`.

## Package Ownership
- `@draftkit/core`: schema, generation pipeline, validation, serialization (framework-agnostic).
- `@draftkit/react`: renderer, overlay UI, chat shell (React-only).
- `@draftkit/next`: Next.js integration adapters only.
- `apps/playground-next`: manual QA and development playground only.

## Dependency Direction (must keep)
- `core` must not import `next` or app code.
- `react` may import `core`, but not `next`.
- `next` may import `core` (and optionally `react` wrappers), but no reverse imports.
- `apps/*` can import all packages.

## Implementation Rules
- Start feature work in `core` first, then wire in `react`, then verify in `playground`.
- Keep public package APIs small and explicit from `src/index.ts`.
- Prefer pure functions and typed contracts in `core`.
- Always run `lint` and `typecheck` for relevant workspaces before finishing.
- When feasible, perform browser verification (e.g. with `agent-browser`) for user-visible flows.
