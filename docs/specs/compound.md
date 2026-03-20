---
doc_type: compound
title: "DraftKit Compound Learnings"
last_updated: "2026-03-20"
---

# Compound Learnings

<!-- Entries are appended by spec-compound after each feature completes. -->

## F-003: Playground Live Editor (2026-03-20)
tags: pattern, decision, learning

- **Pattern**: `LiveProvider` from react-live has built-in auto-render on every keystroke. To decouple editing from rendering (Run-button-only trigger), set the `disabled` prop on `LiveProvider`. Render output via `validateAndRenderJSX` + store in `pipelineResult` state; display with `<LivePreview />` inside the same provider. File: `packages/draftkit-react/src/DraftKitShell.tsx`

- **Decision**: `serializeDraftToJsx` wraps output in `export default function DraftOutput()` — the AST validator rejects `export` as a forbidden keyword. For live preview, `serializeDraftToJsxExpression` was added to core (`packages/draftkit-core/src/serialize.ts`); it returns bare `toJsx(node, 0)` with no wrapper. `serializeDraftToJsx` is kept for copy-to-clipboard and future export use cases where the wrapper is correct. Rejected alternative: stripping the wrapper at call site — fragile and not reusable.

- **Learning (stale artifacts)**: Vitest resolves `.js` before `.tsx` by default. When `tsc` outputs to `src/` (missing `outDir`), compiled artifacts shadow the live source — tests import old code and exports like `renderPreviewContent` appear missing even though the `.tsx` is correct. Fix: add `"outDir": "dist"` to `packages/draftkit-react/tsconfig.json` and delete any existing `.js`/`.d.ts` files in `src/`. File: `packages/draftkit-react/tsconfig.json`

- **Learning (component scope)**: `ComponentRegistry` holds metadata only — NOT actual React component functions. Passing `registry` to `validateAndRenderJSX` does NOT automatically make UI components available in the live scope. `buildScope(additionalComponents?)` merges layout primitives + optional extras. Workaround for F-003: added `components?: Record<string, unknown>` prop to `DraftKitShell`; playground passes real implementations via `playgroundComponents` in `page.tsx`. Long-term fix tracked as MS-020 (automatic scope binding from registry, requires component import paths from MS-017). Files: `packages/draftkit-react/src/DraftKitShell.tsx`, `examples/playground-next/src/app/page.tsx`

- **Reuse**: `renderPreviewContent` and `validationStatusText` are exported pure helpers from `DraftKitShell.tsx` so unit tests can call them directly with `renderToStaticMarkup` (no jsdom needed). Pattern: extract pure render helpers from shell components when testing in a Node environment.

- **Master Trace**: MS-019 (Active → Done via F-003): `validateAndRenderJSX` wired into playground preview, LiveEditor + Run button added, preset buttons replace freeform textarea.

## F-004: Export: Copy JSX + Single-File Component (2026-03-20)
tags: pattern, decision, learning

- **Pattern**: `serializeDraftToComponent(node, registry)` in `packages/draftkit-core/src/serialize.ts` is a pure framework-agnostic function. It recursively collects all unique component types from the `DraftNode` tree, groups them by `importPath`, sorts imports alphabetically, and emits a complete single-file React component with `export default function DraftOutput()`. Any future export target (Storybook story, TypeScript typed wrapper, copy-to-file) can compose from this function without touching the shell or renderer.

- **Decision**: `importPath` is optional on `ComponentSpec` so all existing registry entries remain valid without a migration. The 8 layout primitives in `defaultRegistry` each carry `importPath: "@draftkit/react"`. Registries that omit `importPath` simply produce no named-import line for those components — the caller is responsible for ensuring scope. File: `packages/draftkit-core/src/types.ts`, `packages/draftkit-core/src/validate.ts`

- **Decision**: `import React from "react"` is emitted unconditionally (before named imports) for React < 17 compatibility. Named imports within each `import` statement are sorted alphabetically for deterministic output and stable test assertions.

- **Decision**: `DraftKitShell` now stores `draft: DraftNode | null` in state. The "Copy JSX" button calls `serializeDraftToComponent` when a draft is present, and falls back to `editorCode` otherwise. This keeps the copy output consistent with the actual AST rather than whatever text is in the editor. File: `packages/draftkit-react/src/DraftKitShell.tsx`

- **Learning (vitest config)**: Stale `tsc`-emitted `.js` files in `packages/draftkit-core/src/` caused test failures because vitest resolved `.js` before `.ts`. Fix: add a package-level `packages/draftkit-core/vitest.config.ts` with an explicit `resolve.extensions` order that puts `.ts` before `.js`. This is the same class of problem recorded in F-003 for `draftkit-react`, confirming the root cause: `@draftkit/core/tsconfig.json` has no `outDir`, so `tsc` emits directly into `src/`. This is a latent footgun for every package that runs `pnpm build` then `pnpm test` without cleaning first.

- **Reuse**: `serializeDraftToComponent` is exported from `packages/draftkit-core/src/index.ts`. It is safe to call in any Node or browser context — it performs no I/O and takes `registry` as a plain data argument. Future work: Storybook story emitter, TypeScript prop-types wrapper, and multi-file export can all compose from it.

- **Master Trace**: MS-005 (component serialization to JSX string) and MS-015 (single-file component export with auto-collected imports) both resolved by F-004.
