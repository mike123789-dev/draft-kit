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

## F-005: Automatic Scope Binding from Component Registry (2026-03-20)
tags: pattern, decision, learning

- **Pattern (single registry, dual role)**: A `ComponentRegistry` can serve as the sole source of truth for both validation and render scope by carrying a `component?: unknown` field alongside its existing metadata. `buildScopeFromRegistry(registry)` in `packages/draftkit-react/src/scope.ts` derives the react-live scope by collecting all registry entries where `component` is set, then merging with layout primitives. `validateAndRenderJSX(jsxString, registry)` calls this internally — callers no longer pass a separate components map. `DraftKitShell` dropped `components` prop entirely; one `registry` prop drives both validation and rendering. Files: `packages/draftkit-core/src/types.ts`, `packages/draftkit-react/src/scope.ts`, `packages/draftkit-react/src/DraftKitShell.tsx`, `examples/playground-next/src/app/page.tsx`

- **Decision (`component?: unknown` for framework-agnostic core)**: `ComponentSpec` in `@draftkit/core` uses `component?: unknown` rather than `React.ComponentType` to keep core free of React imports. The trade-off is no static type safety on the component reference — react-live will surface bad values at render time. This is acceptable because component wiring is always verified at runtime in the playground. Any renderer that consumes the registry (react-live today, a future Vue or Svelte renderer tomorrow) casts `unknown` to its own component type.

- **Decision (demoting `buildScope` from public API)**: `buildScope(additionalComponents?)` was previously exported from `@draftkit/react`. It is now an unexported internal helper. `buildScopeFromRegistry` is the only exported scope function. This simplified the test surface: all tests use one entry point and the `additionalScope` escape hatch is gone. If an advanced use case ever needs it, it can be re-exported with a deliberate API design rather than incrementally widened.

- **Learning (Art. 6 hygiene — tsconfig discipline)**: During spec-finish review, `packages/draftkit-core/tsconfig.json` was found to lack `outDir`, causing `tsc` to emit compiled artifacts into `src/` and shadow live TypeScript sources for vitest. The full fix (applied in F-005, should be applied to every new package from day one): (1) add `"outDir": "dist"` to `tsconfig.json`, (2) add a `pretest` script that deletes `dist/` before tests run, (3) add `"exclude": ["**/*.test.ts", "**/*.test.tsx"]` so test files are absent from build output. Without all three, stale `.js` files will silently cause tests to import old code after any `pnpm build` run.

- **Reuse (Storybook compatibility)**: The `component` field on `ComponentSpec` is intentionally untyped and optional so that MS-017 Storybook extraction can populate it from story default exports without an API change. When a story file is parsed, `entry.component = storyModule.default` drops directly into the existing registry shape. No migration of existing registry entries is required — entries without `component` simply produce no scope binding.

- **Master Trace**: MS-020 (automatic scope binding — manual `components` prop eliminated) resolved by F-005. Prerequisite learning recorded in F-003 compound entry ("component scope" learning).
