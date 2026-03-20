---
doc_type: master-spec
title: "DraftKit Master Specification"
last_updated: "2026-03-20"
---

# DraftKit Master Specification

## Product Intent

- Vision: DraftKit is an AI-powered design draft agent that runs on top of existing React applications — generating UI from natural language, rendering it in real-time as an overlay, and exporting production-ready code and PNG images. It is not tied to a specific UI library; it generates UI based on design system components registered via Storybook.
- Target Users: Frontend developers, product managers, and design-savvy users who need rapid UI prototyping within their existing app context.
- User Goal: Describe a UI in plain text, see it rendered live on top of the running app using the project's own design system components, iteratively refine it, and export the result as copy-pasteable JSX or PNG.
- Success Metrics:
  - Generated drafts pass registry validation with zero unknown-component errors.
  - Exported JSX renders identically to the overlay preview.
  - Prompt-to-preview latency under 3 seconds for mock generation.
  - Users can go from prompt to exportable result in under 3 iterative refinement cycles.
- Non-goals:
  - Full code editor or arbitrary JavaScript execution.
  - Backend/API code generation.
  - Modifying existing UI in the host app (MVP excluded).
  - Complex state management (useState, async logic, API calls).
  - Multi-file code export.

## Requirements

| ID     | Area        | Requirement                                                                                                                                                                                    | Priority | Status  | Features |
| ------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | -------- |
| MS-002 | Generation  | Users can enter a text prompt and receive a generated UI draft composed of registry-known components                                                                                           | P0       | Done    | —        |
| MS-003 | Validation  | Generated drafts are validated against the component registry, surfacing unknown-component and invalid-prop errors                                                                             | P0       | Done    | —        |
| MS-004 | Preview     | Users can see a live overlay preview of the generated draft rendered with react-live                                                                                                           | P0       | Done    | —        |
| MS-005 | Export      | Users can copy the serialized JSX code of a validated draft to clipboard                                                                                                                       | P0       | Done    | F-004    |
| MS-006 | Registry    | A component registry defines available components and their allowed props, sourced from Storybook extraction                                                                                   | P0       | Done    | —        |
| MS-007 | Export      | Users can export the rendered preview as a PNG image                                                                                                                                           | P1       | Active  | —        |
| MS-008 | UI          | Users interact with DraftKit through a chat panel (right side) to input natural language UI requests and receive generated results                                                             | P0       | Active  | —        |
| MS-009 | Layout      | DraftKit provides a built-in layout system with primitives (Page, Section, Container, Stack, Inline, Grid, Spacer, Divider) that must be used instead of raw div elements                      | P0       | Done    | F-001    |
| MS-010 | Preview     | Generated UI is displayed as an overlay on top of the host application, not replacing existing UI                                                                                              | P0       | Active  | —        |
| MS-011 | Validation  | Validation enforces: only registry components allowed, only declared props allowed, no imports, no window/document access, no arbitrary JS execution                                           | P0       | Done    | F-002    |
| MS-012 | Generation  | Users can iteratively refine generated UI through follow-up chat messages without starting over                                                                                                | P0       | Active  | —        |
| MS-013 | Interaction | Draft previews support basic UI interactions (button clicks, tabs, accordion, dialog) but disallow useState, API calls, and async logic                                                        | P0       | Active  | —        |
| MS-014 | Rendering   | Rendering engine uses react-live with a restricted scope, allowing only registry-approved components                                                                                           | P0       | Active  | F-002    |
| MS-015 | Export      | Code export produces a single-file React component with imports, clean JSX, ready for copy-paste                                                                                               | P0       | Done    | F-004    |
| MS-016 | Layout      | Layout primitives enforce gap-based spacing, no raw divs, max nesting depth of 3-4 levels, and responsive behavior via primitive props                                                         | P0       | Done    | F-001    |
| MS-017 | Registry | Component registry includes component name, props (from argTypes), default values, description, and import path extracted from Storybook | P0 | Done | F-006 |
| MS-018 | UI          | DraftKit supports a fullscreen draft canvas mode as an alternative to the default chat+overlay layout                                                                                          | P2       | Planned | —        |
| MS-019 | Preview     | The playground provides a live editor with a syntax-highlighted JSX editor, Run button, validated react-live preview, and Mini/Small/Medium preset draft buttons replacing the freeform prompt | P0       | Done    | F-003    |
| MS-020 | Registry | The render scope is automatically built from the component registry so that any registered component is available in the live preview without manual scope injection in the host application | P0 | Done | F-005 |

<!-- Priority: P0 = must have, P1 = should have, P2 = nice to have -->
<!-- Status: Active, Done, Deprecated, Planned -->

## Define Decision Log

| Date       | Request                                                 | Decision | MS IDs         | Why                                                                                                                                                                                                                            |
| ---------- | ------------------------------------------------------- | -------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-01-01 | Initial bootstrap requirement capture                   | New      | MS-001         | Seed first product capability from current project scope                                                                                                                                                                       |
| 2026-03-20 | Layout System feature spec                              | Reuse    | MS-009, MS-016 | Both requirements describe the same layout system capability; F-001 implements them together                                                                                                                                   |
| 2026-03-20 | AST Validation + Restricted Rendering feature spec      | Reuse    | MS-011, MS-014 | Both requirements describe the validation-to-rendering pipeline; F-002 implements them as one feature                                                                                                                          |
| 2026-03-20 | Wire validateAndRenderJSX into playground preview panel | New      | MS-019         | Users cannot currently see live JSX validation and react-live rendering in the preview — DraftNode tree renderer is being replaced with the validated react-live engine built in F-002                                         |
| 2026-03-20 | Automatic scope binding from component registry         | New      | MS-020         | Playground currently requires manual components prop injection (page.tsx workaround); registry should drive scope automatically once MS-017 import paths are available — new capability, not a refinement of existing behavior |
| 2026-03-20 | Automatic scope binding feature spec | New | MS-020 | Registry entries need a component reference field so buildScopeFromRegistry can derive the react-live scope automatically; eliminates separate components prop on DraftKitShell and the drift risk between registry metadata and actual rendered components |

## Glossary

| Term               | Definition                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Draft              | A tree of DraftNode objects representing a generated UI layout, produced by the generation pipeline                    |
| Component Registry | A map of component names to their specs (allowed props, children rules), used for validation and code generation       |
| DraftNode          | A single node in the draft tree, containing a component type, props, and optional children                             |
| Overlay Preview    | A live-rendered preview of a draft using react-live, shown in the playground UI before export                          |
| Serialization      | Converting a DraftNode tree into copy-pasteable JSX source code                                                        |
| Layout Primitives  | Base structural components (e.g., Flex, Grid, Stack) available as building blocks in draft generation                  |
| Chat Panel         | The right-side UI panel where users input natural language prompts and see generation results                          |
| Scope (react-live) | The set of components and utilities exposed to the react-live renderer; only registry-approved components are included |
| Host Application   | The existing React application on top of which DraftKit runs as an overlay; DraftKit does not modify the host app's UI |
| AST Validation     | Static analysis of generated JSX using @babel/parser to enforce security and registry constraints before rendering     |

## Amendment Policy

- Requirements, Define Decision Log, and Glossary are script-managed. Do not hand-edit these sections.
- Add or update requirement rows only via scripted operations.
- Append decision records only via scripted operations.
- Add or update glossary rows only via scripted operations.
- A feature spec may not be opened unless it links to at least one MS-xxx ID.
- Retiring an MS-xxx ID requires updating all linked feature specs.
