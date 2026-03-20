---
doc_type: spec
feature_id: "F-004"
title: "Export: Copy JSX + Single-File Component"
status: Done
owner: agent
master_spec_id: "MS-015"
ui_impact: true
last_updated: "2026-03-20"
---

# Export: Copy JSX + Single-File Component

## Objective

Users who design a layout in DraftKit should be able to copy a complete, paste-ready React component — with correct import statements — rather than a bare JSX expression. This closes the gap between MS-005 (copy JSX) and MS-015 (single-file component export), making the exported code immediately usable without manual import wiring.

## User Stories

- As a developer using DraftKit to prototype layouts, I want the "Copy JSX" action to produce a self-contained React component file so that I can paste it directly into my project without adding import statements by hand.
- As a developer extending the DraftKit component registry, I want each component definition to optionally declare where it is imported from so that the serializer can automatically generate correct import lines for any registry.

## Acceptance Criteria

- [x] AC-1 [behavioral]: `ComponentSpec` type accepts an optional `importPath: string` field. Attempting to construct a `ComponentSpec` without the field compiles without error; supplying it is also valid.
- [x] AC-2 [behavioral]: All 8 layout primitives defined in `defaultRegistry` (Page, Section, Container, Stack, Inline, Grid, Spacer, Divider) carry `importPath: "@draftkit/react"`.
- [x] AC-3 [behavioral]: `serializeDraftToComponent(node, registry)` is exported from the public API of `@draftkit/core`.
- [x] AC-4 [behavioral]: The string returned by `serializeDraftToComponent` begins with `import React from "react"`, followed by one or more named import statements grouped by unique `importPath`, followed by the `export default function DraftOutput()` wrapper containing the JSX body.
- [x] AC-5 [behavioral]: `serializeDraftToComponent` traverses the full depth of a nested `DraftNode` tree and collects every unique component type name exactly once per import path, regardless of how deeply nested or how many times a component appears.
- [x] AC-6 [behavioral]: Component types that have no `importPath` in the registry are excluded from all import statements; they appear only inside the JSX body.
- [x] AC-7 [behavioral]: DraftKitShell stores the raw `DraftNode` value in its state when a preset is selected, and clears that value when the editor is reset.
- [x] AC-8 [behavioral]: When a `DraftNode` is present in DraftKitShell state, activating "Copy JSX" writes the output of `serializeDraftToComponent` to the clipboard. When no `DraftNode` is present but `editorCode` is non-empty, the button writes `editorCode` to the clipboard (existing fallback). The button is disabled when both values are absent.
- [x] AC-9 [behavioral]: The full test suite (lint, typecheck, unit tests) passes with no regressions after all changes.

## Out of Scope

- Generating TypeScript (`.tsx`) output or adding type annotations to the exported component — the output is plain `.jsx`-compatible JavaScript.
- Downloading the component as a file — only clipboard copy is in scope.
- Supporting import paths for components outside `defaultRegistry` (custom registries may opt in by supplying `importPath`, but no tooling is added to enforce or discover them).
- Formatting or prettifying the output (no Prettier integration).
- Supporting multiple export targets (e.g. Storybook story, styled-components wrapper).

## Constraints

- `serializeDraftToComponent` must reside in `@draftkit/core` and must not import from `@draftkit/react` or any framework — it receives the registry as a plain data argument.
- The `importPath` field on `ComponentSpec` must be optional so that existing registry entries without it remain valid without any migration.
- The `import React from "react"` line must always be emitted first, unconditionally, to support React versions below 17 where the JSX transform requires it in scope.
- The "Copy JSX" button behavior change must be fully backward-compatible: if `draft` state is absent, copying `editorCode` must work exactly as before MS-015 work began.

## Defaults & Assumptions

- `import React from "react"` is always emitted as the first line (default-import style, not namespace import), matching conventional React component file conventions.
- Named imports for a given `importPath` are emitted in a single `import { A, B, C } from "path"` statement, with component names sorted alphabetically for deterministic output.
- The exported function name is always `DraftOutput` — no parameterization in this scope.
- Components missing from the registry entirely (unknown types present in the tree) are silently skipped for import generation; they will still appear in the JSX body via whatever fallback the serializer already applies.

## Dependencies

- `@draftkit/core` `ComponentSpec` type and `ComponentRegistry` type must be the single source of truth for registry shape — no parallel type definitions.
- `@draftkit/react` primitive components (Page, Section, Container, Stack, Inline, Grid, Spacer, Divider) must exist as named exports at the `"@draftkit/react"` package path for the generated imports to resolve correctly at consumer build time.
- MS-005: existing clipboard copy behavior, which this feature refines.
- MS-015: master requirement this feature implements.

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| DraftNode tree contains only one component type, used multiple times | Exactly one named import entry for that type; no duplicates |
| DraftNode tree is a single leaf node with no children | Import for that one component is generated; JSX body is a single self-closing or paired element |
| All components in the tree have no `importPath` in the registry | `import React from "react"` is emitted; no other import lines; JSX body is rendered as-is |
| DraftNode tree contains a component type not present in the registry | That type is excluded from imports; it still appears in the JSX body |
| `registry` argument is an empty object `{}` | Only `import React from "react"` is emitted; no named imports |
| User clicks "Copy JSX" when preset has been selected then cleared | Button is disabled (neither draft nor editorCode present); no clipboard write occurs |
| `serializeDraftToComponent` called with a deeply nested tree (5+ levels) | All component types at all depths are collected; output is correct and no stack overflow occurs for realistic document sizes |

## Health Metrics

- Existing `serializeDraftToJsx` and `serializeDraftToJsxExpression` outputs must be unchanged — no regressions to current snapshot/unit tests.
- `@draftkit/core` bundle must remain framework-agnostic (no React runtime import).

## Review Checklist

- [x] All [NEEDS CLARIFICATION] markers resolved
- [x] Acceptance criteria are specific and testable
- [x] Non-goals explicitly stated
- [x] Constraints are explicit
- [x] Edge and failure scenarios are covered
