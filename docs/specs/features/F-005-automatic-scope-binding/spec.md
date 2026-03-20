---
doc_type: spec
feature_id: "F-005"
title: "Automatic Scope Binding from Component Registry"
status: Done
owner: agent
master_spec_id: "MS-020"
ui_impact: false
last_updated: "2026-03-20"
---

# Automatic Scope Binding from Component Registry

## Objective

Eliminate the manual `components` prop on `DraftKitShell` by deriving the react-live render scope automatically from the component registry. Any registry entry that carries a `component` reference is made available in the live preview without additional host-application wiring, reducing the risk of drift between registry metadata and the actual components used for rendering.

## User Stories

- As a host-application developer, I want to pass a single `registry` prop to `DraftKitShell` and have the live preview work correctly, so I do not have to maintain a separate `components` map that mirrors the registry.
- As a DraftKit integrator, I want registry entries to optionally carry the runtime component reference alongside their spec data, so I can populate a registry once and use it for both validation and rendering.
- As a maintainer of the DraftKit pipeline, I want the scope-building logic to be a named, testable function in `@draftkit/react`, so scope assembly can be verified independently of the shell component.
- As a future contributor implementing Storybook extraction (MS-017), I want the registry's `component` field to exist as a defined contract, so Storybook-sourced registries can populate it naturally without a breaking API change.

## Acceptance Criteria

- [x] AC-1 [behavioral]: `ComponentSpec` in `@draftkit/core` has an optional `component?: unknown` field. A registry entry that supplies any value for `component` is accepted by the TypeScript type system without type errors. A registry entry that omits `component` is also valid.
- [x] AC-2 [behavioral]: `buildScopeFromRegistry(registry)` exported from `@draftkit/react` returns a scope object that contains all layout primitives AND the `component` value of every registry entry where `component` is set and non-nullish. Registry entries where `component` is absent or `undefined` contribute nothing to the scope beyond the primitives.
- [x] AC-3 [behavioral]: `buildScopeFromRegistry(registry)` uses the registry entry's `name` field as the scope key. Given a registry entry `{ name: "Badge", component: BadgeComponent }`, the returned scope contains `{ Badge: BadgeComponent, ...primitives }`.
- [x] AC-4 [behavioral]: `validateAndRenderJSX(jsxString, registry)` builds its render scope by calling `buildScopeFromRegistry(registry)` internally. The function signature no longer requires a separate `additionalScope` parameter.
- [x] AC-5 [behavioral]: `DraftKitShell` renders a correct live preview when the `registry` prop entries include `component` references, without any `components` prop being passed.
- [x] AC-6 [behavioral]: `DraftKitShell` does not accept a `components` prop. Its TypeScript props type does not include a `components` field. Passing only `registry` (with embedded `component` references) is sufficient for a working preview.
- [x] AC-7 [behavioral]: In the playground `page.tsx`, the separate `playgroundComponents` map is removed. A single registry value includes both spec data and `component` references for all registered UI components (Badge, Button, Card, and any others previously listed in `playgroundComponents`).
- [x] AC-8 [behavioral]: Existing AST validation behavior (forbidden pattern checks, component name checks against the registry) is unchanged. All unit tests introduced by F-002 continue to pass without modification.
- [x] AC-9 [behavioral]: Layout primitives (Stack, Page, Container, and all others previously returned by `buildScope`) remain available in the render scope for any registry, including an empty registry and a registry whose entries all have `component: undefined`. No registry entry is required to re-register a primitive.

## Non-Goals

- Storybook extraction or auto-discovery of components from story files (MS-017 scope).
- Changing the AST validation logic, forbidden-pattern list, or component-name checks from F-002.
- Adding new layout primitives or modifying the existing primitive set.
- Dynamic or lazy loading of component modules at render time.
- Removing `buildScope` as a lower-level utility — it may remain as an internal function but is superseded by `buildScopeFromRegistry` as the primary public API.
- Supporting multiple registry entries with the same `name` — duplicate names in a registry are not a goal of this feature.

## Constraints

- `@draftkit/core` must remain framework-agnostic: no React imports in `core`. The `component?: unknown` field on `ComponentSpec` uses the `unknown` type, not `React.ComponentType` or any React-specific type.
- All React-specific scope logic (`buildScopeFromRegistry`, scope merging, react-live integration) must reside in `@draftkit/react`.
- The dependency direction `core → react` is forbidden. `core` must not import from `react`.
- `buildScopeFromRegistry` must be a pure function: given the same registry, it always returns an equivalent scope object.

## Defaults & Assumptions

- A registry entry's `name` field is the authoritative key used in the scope. It must match the JSX component name used in generated output (e.g., `"Badge"` maps to `<Badge />`).
- If a registry entry's `name` conflicts with a layout primitive name, the registry entry's `component` value takes precedence in the merged scope. This avoids silent primitive shadowing being invisible to the caller.
- An empty registry (`[]` or `{}`) is a valid input to `buildScopeFromRegistry`; it returns the primitives-only scope.
- The `component` field stores the runtime value as received — no validation of whether it is actually a callable React component is performed at scope-build time. Invalid values produce a rendering error, not a type error.

## Dependencies

- F-002 (AST Validation and Restricted Rendering Engine): the `validateAndRenderJSX` function and the `buildScope` utility being updated here were established in F-002. F-002 must be complete before this feature modifies those contracts.
- F-003 (Playground Live Preview): `DraftKitShell` consuming the pipeline was wired in F-003. F-003 must be complete before the `components` prop is removed from `DraftKitShell`.
- `ComponentSpec` type in `@draftkit/core/src/types.ts` must be the single source of truth for the registry entry shape. No duplicate type definitions should exist across packages.

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Registry is an empty array or empty object | `buildScopeFromRegistry` returns the primitives-only scope with no additional entries. |
| Registry entry has `component: undefined` | Entry is treated as if `component` is absent; no key is added to the scope for that entry. |
| Registry entry has `component: null` | Same as `undefined` — entry contributes no scope key. |
| Two registry entries share the same `name` | The last entry's `component` wins in the merged scope (standard object-merge behavior). No error is thrown. |
| Registry entry `name` matches a layout primitive (e.g., `"Stack"`) | Registry entry's `component` shadows the primitive under that key. The other primitives are unaffected. |
| Registry entry has `component` set but `name` is empty string | `buildScopeFromRegistry` skips the entry (empty string is not a valid JSX component name). |
| JSX references a component whose registry entry exists but `component` was not set | AST validation passes (name is in registry), but rendering fails because the scope has no entry for that name. The rendering engine surfaces this as a missing-component error, consistent with F-002 AC-8. |
| `validateAndRenderJSX` called with a registry where all entries lack `component` | AST validation runs normally. Rendering scope contains only primitives. JSX using only primitives renders correctly; JSX using registry-named components fails at render with a missing-component error. |
| Host passes `registry` prop containing a non-serializable value in `component` (e.g., a class instance) | `buildScopeFromRegistry` includes the value as-is. Rendering behavior depends on react-live; this is not a scope-build concern. |

## Health Metrics

- All F-002 unit tests (`validateAndRenderJSX`, `buildScope`, AST validation) pass without modification after this change.
- All F-003 unit tests (`DraftKitShell` render behavior, preset button rendering) pass after the `components` prop is removed.
- `buildScopeFromRegistry` is covered by unit tests: at minimum one test per edge case row above that involves scope output (empty registry, undefined component, name collision, primitive shadowing).

## Review Checklist

- [x] All [NEEDS CLARIFICATION] markers resolved
- [x] Acceptance criteria are specific and testable
- [x] Non-goals explicitly stated
- [x] Constraints are explicit
- [x] Edge and failure scenarios are covered
