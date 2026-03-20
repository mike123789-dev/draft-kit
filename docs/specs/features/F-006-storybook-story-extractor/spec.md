---
doc_type: spec
feature_id: "F-006"
title: "Storybook Story Extractor"
status: Done
owner: agent
master_spec_id: "MS-017"
ui_impact: false
last_updated: "2026-03-20"
---

# Storybook Story Extractor

## Objective

Provide a static, AST-based utility in `@draftkit/core` that reads Storybook story files and produces `ComponentSpec` and `ComponentRegistry` values from the metadata already declared in each story's `parameters.draftkit` block, so the registry can be derived from the single source of truth (the stories) rather than maintained separately by hand.

## User Stories

- As a DraftKit integrator, I want to call a function with story file contents and receive a `ComponentRegistry`, so I can stop manually mirroring argType changes into `defaultRegistry`.
- As a DraftKit core developer, I want the extractor to live in `@draftkit/core` with no framework imports, so it can be used by any host environment (Next.js, Vite, plain Node scripts).
- As a developer writing a new story, I want missing or malformed `parameters.draftkit` blocks to be silently skipped rather than thrown, so adding stories never breaks an existing registry build.

## Acceptance Criteria

All ACs are behavioral — automated unit tests are required for each.

- [ ] AC-1 (behavioral): `extractSpecFromStory` returns `null` when the story file content does not contain a `parameters.draftkit` block (i.e., the `parameters` key is absent or `parameters.draftkit` is absent from the default-exported meta object).
- [ ] AC-2 (behavioral): `extractSpecFromStory` returns a `ComponentSpec` whose `name` field equals the value of `parameters.draftkit.componentName` in the parsed story.
- [ ] AC-3 (behavioral): `extractSpecFromStory` sets `allowedProps` to the array of keys found in `argTypes`, excluding any key whose argType value contains an `action` property (action-type props); when `argTypes` is absent from the meta object, `allowedProps` is an empty array `[]`.
- [ ] AC-4 (behavioral): `extractSpecFromStory` builds `propDefs` from `argTypes` according to the following mapping rules, with `default` values sourced from the `args` object of the same meta; when `args` is absent or a key has no matching entry in `args`, the `default` field is omitted from that `PropDef`:
  - `argType.control === "select"` and `options` array present → `type: "enum"`, `values: options`
  - `argType.control === "boolean"` → `type: "boolean"`
  - `argType.control === "text"` → `type: "string"`
  - `argType.control === "number"` → `type: "number"`
  - When `argTypes` is absent, `propDefs` is an empty object `{}`.
- [ ] AC-5 (behavioral): `extractSpecFromStory` sets `description` to the value of `parameters.draftkit.description` and `importPath` to the value of `parameters.draftkit.importPath`; both are `undefined` when absent from the `draftkit` block.
- [ ] AC-6 (behavioral): The `ComponentSpec` returned by `extractSpecFromStory` does not include a `component` property (the key is absent from the returned object, not merely set to `undefined`), because extraction is static and runtime component references are bound separately by the host.
- [ ] AC-7 (behavioral): `extractRegistryFromStories(filePaths)` reads each file at the given paths, calls `extractSpecFromStory` on each file's content, and returns a `ComponentRegistry` (keyed by `name`) containing only the specs for files whose story content yields a non-null result; files without a `parameters.draftkit` block are silently omitted from the registry.
- [ ] AC-8 (behavioral): `extractRegistryFromStories` called with the paths to all five existing story files under `examples/playground-next/src/components/ui/` returns a registry containing entries with keys `"Badge"`, `"Button"`, `"Card"`, `"Input"`, and `"Textarea"`, each with a non-empty `allowedProps` array and the correct `importPath` matching the value declared in that story's `parameters.draftkit.importPath`.
- [ ] AC-9 (behavioral): Both `extractSpecFromStory` and `extractRegistryFromStories` are named exports of the `@draftkit/core` package (resolvable via its public `src/index.ts`).

## Non-Goals

- This feature does not start, connect to, or require a running Storybook server. Extraction is fully static.
- This feature does not modify or replace `defaultRegistry`. The two registries coexist; the host chooses which to use.
- This feature does not perform file-system discovery (glob, directory scanning). The caller is responsible for supplying file paths.
- This feature does not add `.storybook/` configuration, addons, or webpack/Vite plugins.
- This feature does not bind runtime component references (the `component` field of `ComponentSpec`). Callers that need live component refs follow the F-005 scope-binding pattern after extraction.
- This feature does not validate that extracted `importPath` values resolve to real modules.
- This feature does not support `.mdx` story format or Component Story Format 1.x (named-export-only, no default meta export).
- This feature does not watch story files for changes; it is a one-shot extraction utility.

## Constraints

- `@draftkit/core` must remain framework-agnostic. The extractor must not import React, Next.js, or any browser API.
- AST parsing must use `@babel/parser`, which is already a dependency of `@draftkit/core`. No additional build-time parsers may be introduced.
- File I/O in `extractRegistryFromStories` must use Node.js built-in `node:fs/promises` only — no new npm dependencies may be added to `@draftkit/core` to support file reading.
- `extractSpecFromStory` accepts file content as a `string`. It has no file-system access of its own.
- The `component` field must never be set by this extractor — not even to `null`. The field must be entirely absent from returned specs.
- Any story file that causes a parse error must not throw to the caller. `extractSpecFromStory` returns `null` for unparseable content; `extractRegistryFromStories` skips that file silently.

## Defaults & Assumptions

- When `argTypes` is present but a given key has no `control` value that matches a known mapping (`select`, `boolean`, `text`, `number`), that key is still included in `allowedProps` but its entry in `propDefs` is omitted (no partial `PropDef` is created for it).
- When `args` contains a default value for a prop but `argTypes` has no corresponding entry, that value is not surfaced in the returned spec — `propDefs` is driven by `argTypes`, not `args`.
- The `name` field of the returned `ComponentSpec` is taken from `parameters.draftkit.componentName`, not from `meta.title` or the inferred component name. Stories that omit `componentName` produce `null`.
- When two files in `extractRegistryFromStories` yield specs with the same `name`, the last one in the supplied `filePaths` array wins (last-write semantics, consistent with `Object.assign` behavior over the accumulating registry).
- Story files are assumed to be UTF-8 encoded.
- `@babel/parser` is invoked with TypeScript and JSX plugins enabled, matching the TSX syntax used in the existing story files.

## Dependencies

- `ComponentSpec`, `ComponentRegistry`, and `PropDef` types defined in `@draftkit/core/src/types.ts` — this feature extends the public API of that module.
- F-005 (Automatic Scope Binding): establishes the pattern for attaching runtime `component` references to a registry after static extraction. F-006 extraction deliberately leaves `component` absent so F-005 can fill it without conflict.
- `@babel/parser` (existing dependency in `@draftkit/core`) — AST parsing capability.
- Node.js built-in `node:fs/promises` — file reading in `extractRegistryFromStories`.
- The five story files in `examples/playground-next/src/components/ui/` serve as the canonical fixture set for AC-8.

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Story file has `parameters` but no `parameters.draftkit` key | `extractSpecFromStory` returns `null`; `extractRegistryFromStories` skips the file |
| Story file has `parameters.draftkit` but no `componentName` field | `extractSpecFromStory` returns `null` (name is required to key the registry) |
| `argTypes` is present but empty (`argTypes: {}`) | `allowedProps` is `[]`, `propDefs` is `{}` |
| `argTypes` is absent from the meta object | `allowedProps` is `[]`, `propDefs` is `{}` |
| `args` is absent from the meta object | All `PropDef` entries are created without a `default` field |
| An argType has `action: "clicked"` (action-type) | That key is excluded from `allowedProps` and from `propDefs` |
| An argType has `control: "select"` but no `options` array | Key included in `allowedProps`; `propDefs` entry has `type: "enum"` with `values: []` |
| An argType has an unrecognized `control` value (e.g., `"color"`) | Key included in `allowedProps`; no `propDefs` entry is created for that key |
| File content is not valid TypeScript/JavaScript (parse error) | `extractSpecFromStory` returns `null`; no exception propagates to caller |
| `extractRegistryFromStories` receives an empty array `[]` | Returns an empty object `{}` |
| `extractRegistryFromStories` receives a path that does not exist | That file is skipped silently; the rest of the registry is still built |
| Two files declare the same `componentName` | Last file in the `filePaths` array overwrites the earlier entry in the registry |
| `parameters.draftkit.importPath` is absent | Returned `ComponentSpec` has `importPath: undefined` |
| `parameters.draftkit.description` is absent | Returned `ComponentSpec` has `description: undefined` |

## Health Metrics

- `@draftkit/core` lint and typecheck pass with zero new errors after this feature is added.
- Unit test suite for `@draftkit/core` passes in full; no existing test regressions.

## Review Checklist

- [ ] All [NEEDS CLARIFICATION] markers resolved
- [ ] Acceptance criteria are specific and testable
- [ ] Non-goals explicitly stated
- [ ] Constraints are explicit
- [ ] Edge and failure scenarios are covered
