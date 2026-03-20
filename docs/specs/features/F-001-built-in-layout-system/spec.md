---
doc_type: spec
feature_id: "F-001"
title: "Built-in Layout System"
status: Done
owner: agent
master_spec_id: "MS-009"
ui_impact: false
last_updated: "2026-03-20"
---

# Built-in Layout System

## Objective

Provide a closed set of layout primitives (Page, Section, Container, Stack, Inline, Grid, Spacer, Divider) with typed prop contracts, enforced structural validation rules, and correct rendering so that AI-generated drafts are structurally sound, spacing is gap-based rather than ad-hoc, and invalid layouts are rejected before reaching the renderer.

## User Stories

- As an AI generation pipeline, I want each layout primitive to have a machine-readable prop contract with types, allowed values, and defaults so that I can produce valid drafts without guessing.
- As a draft author (human or AI), I want validation to reject raw HTML elements and excessive nesting so that every draft follows the layout-primitive-only constraint automatically.
- As a React consumer of DraftKit, I want layout primitives to render their declared props (gap, columns, align, wrap, maxWidth) so that the visual output matches the intent captured in the draft schema.
- As a plugin or downstream tool author, I want the registry schema to describe children constraints so that I can statically determine which component nesting patterns are legal.

## Acceptance Criteria

### Behavioral

- [ ] AC-1: Each of the 8 layout primitives (Page, Section, Container, Stack, Inline, Grid, Spacer, Divider) has a typed prop interface in core that declares every allowed prop name, its value type, allowed values (if enumerated), and default value. Passing a prop not in the interface causes a validation error.
- [ ] AC-2: Stack, Inline, and Grid each accept a `gap` prop (number). When rendered in `@draftkit/react`, the gap value controls the spacing between child elements. Default: 12.
- [ ] AC-3: Grid accepts a `columns` prop (positive integer). When rendered, the grid displays the specified number of equal-width columns. Default: 1.
- [ ] AC-4: Stack and Inline each accept `align` and `justify` props (string, values from a defined enum set). When rendered, these props control cross-axis alignment and main-axis justification respectively.
- [ ] AC-5: Inline accepts a `wrap` prop (boolean, default true). When `wrap` is true, children that exceed the container width flow to the next line. When false, children remain on a single line.
- [ ] AC-6: Container accepts a `maxWidth` prop (number or string). When rendered, the container constrains its width to the specified value. Default: 960.
- [ ] AC-7: Validation rejects any draft where layout primitives are nested more than 4 levels deep. A draft at exactly 4 levels passes. A draft at 5 levels returns a validation error that identifies the offending node path.
- [ ] AC-8: Validation rejects any draft containing raw HTML element names (div, span, p, h1-h6, ul, ol, li, table, img, a, section, article, header, footer, main, nav, aside, form, input, button, textarea, select, label) at any level. The error message identifies the disallowed element name and its location.
- [ ] AC-9: The `ComponentSpec` schema in core includes: prop type (string, number, boolean, enum), default value per prop, and children constraints (whether children are allowed, and optionally which primitive types are permitted as direct children). The registry exposes this enriched schema for all 8 layout primitives.
- [ ] AC-10: All 8 layout primitives in `@draftkit/react` render their declared props correctly. Specifically: each prop from the typed interface in core produces the expected visual or DOM effect when rendered.

### Visual

No visual-only ACs. All rendering behavior is verifiable through DOM/style assertions.

## Non-Goals

- Responsive breakpoint system beyond Container's `maxWidth` prop. No media-query-driven prop variants (e.g., `gap={{ sm: 8, lg: 16 }}`).
- Animation or transition support on layout primitives.
- CSS-in-JS integration, Tailwind class generation, or any coupling to a specific styling solution.
- Theme token resolution at the core level. Props accept raw values; mapping to design tokens is a separate concern.
- Visual design of the primitives (colors, borders, decorative styles). These are structural layout components only.

## Constraints

- Core logic (`@draftkit/core`) must remain framework-agnostic. No React, DOM, or browser API references.
- React rendering (`@draftkit/react`) may import core but not the reverse.
- DraftKit must not mandate a specific UI component library. Layout primitives wrap structure, not appearance.
- The set of layout primitives is fixed at 8 (Page, Section, Container, Stack, Inline, Grid, Spacer, Divider). Adding new primitives is out of scope for this feature.
- Max nesting depth of 4 is a hard limit enforced by validation, not advisory.
- No raw HTML elements are permitted in valid drafts. All content must use registered primitives or registered UI components.

## Defaults & Assumptions

- `gap` default: 12 (interpreted as pixels by the renderer).
- `Grid.columns` default: 1.
- `Container.maxWidth` default: 960 (interpreted as pixels by the renderer).
- `Spacer.size` default: 8 (interpreted as pixels by the renderer).
- `Inline.wrap` default: true.
- Nesting depth limit: 4 levels of layout primitives. Non-layout registered components (UI components) do not count toward the depth limit.
- `align` and `justify` accept standard CSS flexbox/grid alignment values: "start", "center", "end", "stretch", "space-between", "space-around", "space-evenly" (justify only where applicable).
- Spacer and Divider accept no children. Passing children to them is a validation error.
- Page is always the root-level layout primitive. A draft must have Page as its outermost layout node.

## Dependencies

- Existing `DraftNode` type system in `@draftkit/core` (currently defined in `types.ts`).
- Existing component registry system in `@draftkit/core` (currently `defaultRegistry` in `layout.ts`).
- Existing validation pipeline in `@draftkit/core` (currently `validate.ts`).

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Layout primitive with empty children array | Valid. Renders as an empty container element with no content. |
| Layout primitive with `undefined`/missing optional props | Valid. All optional props fall back to their declared defaults. |
| Nesting depth exactly at limit (4 levels) | Valid. Validation passes. |
| Nesting depth at 5 levels | Invalid. Validation returns error identifying the node path that exceeds depth 4. |
| Unknown prop name on a layout primitive | Invalid. Validation returns error naming the unrecognized prop and the component it was set on. |
| Unknown prop value for an enum prop (e.g., `align: "bogus"`) | Invalid. Validation returns error naming the prop, the invalid value, and the allowed values. |
| Raw HTML element nested inside a valid layout primitive | Invalid. Validation returns error identifying the raw element name and its location in the tree. |
| Spacer or Divider with children | Invalid. Validation returns error stating that the component does not accept children. |
| Mixing layout primitives with registered UI components | Valid, as long as nesting depth and children constraints are satisfied. UI components do not count toward layout nesting depth. |
| Grid with `columns: 0` or negative number | Invalid. Validation returns error: columns must be a positive integer. |
| Gap with negative value | Invalid. Validation returns error: gap must be a non-negative number. |
| Container with maxWidth of 0 | Valid but degenerate. Renders a zero-width container. No validation error. |

## Health Metrics

- Existing validation tests must continue to pass (prop-name and component-name checks are being extended, not replaced).
- Existing `DraftNode` serialization/deserialization round-trips must not break.
- Build and typecheck for `@draftkit/core` and `@draftkit/react` must pass with no new errors.

## Review Checklist

- [x] All [NEEDS CLARIFICATION] markers resolved
- [x] Acceptance criteria are specific and testable
- [x] Non-goals explicitly stated
- [x] Constraints are explicit
- [x] Edge and failure scenarios are covered
