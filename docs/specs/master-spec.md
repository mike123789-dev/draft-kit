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

| ID | Area | Requirement | Priority | Status | Features |
|----|------|-------------|----------|--------|----------|
| MS-002 | Generation | Users can enter a text prompt and receive a generated UI draft composed of registry-known components | P0 | Done | — |
| MS-003 | Validation | Generated drafts are validated against the component registry, surfacing unknown-component and invalid-prop errors | P0 | Done | — |
| MS-004 | Preview | Users can see a live overlay preview of the generated draft rendered with react-live | P0 | Done | — |
| MS-005 | Export | Users can copy the serialized JSX code of a validated draft to clipboard | P0 | Done | — |
| MS-006 | Registry | A component registry defines available components and their allowed props, sourced from Storybook extraction | P0 | Done | — |
| MS-007 | Export | Users can export the rendered preview as a PNG image | P1 | Active | — |
| MS-008 | UI | Users interact with DraftKit through a chat panel (right side) to input natural language UI requests and receive generated results | P0 | Active | — |
| MS-009 | Layout | DraftKit provides a built-in layout system with primitives (Page, Section, Container, Stack, Inline, Grid, Spacer, Divider) that must be used instead of raw div elements | P0 | Active | — |
| MS-010 | Preview | Generated UI is displayed as an overlay on top of the host application, not replacing existing UI | P0 | Active | — |
| MS-011 | Validation | Validation enforces: only registry components allowed, only declared props allowed, no imports, no window/document access, no arbitrary JS execution | P0 | Active | — |
| MS-012 | Generation | Users can iteratively refine generated UI through follow-up chat messages without starting over | P0 | Active | — |
| MS-013 | Interaction | Draft previews support basic UI interactions (button clicks, tabs, accordion, dialog) but disallow useState, API calls, and async logic | P0 | Active | — |
| MS-014 | Rendering | Rendering engine uses react-live with a restricted scope, allowing only registry-approved components | P0 | Active | — |
| MS-015 | Export | Code export produces a single-file React component with imports, clean JSX, ready for copy-paste | P0 | Active | — |
| MS-016 | Layout | Layout primitives enforce gap-based spacing, no raw divs, max nesting depth of 3-4 levels, and responsive behavior via primitive props | P0 | Active | — |
| MS-017 | Registry | Component registry includes component name, props (from argTypes), default values, description, and import path extracted from Storybook | P0 | Active | — |
| MS-018 | UI | DraftKit supports a fullscreen draft canvas mode as an alternative to the default chat+overlay layout | P2 | Planned | — |

<!-- Priority: P0 = must have, P1 = should have, P2 = nice to have -->
<!-- Status: Active, Done, Deprecated, Planned -->

## Define Decision Log

| Date | Request | Decision | MS IDs | Why |
|------|---------|----------|--------|-----|
| 2026-01-01 | Initial bootstrap requirement capture | New | MS-001 | Seed first product capability from current project scope |

## Glossary

| Term | Definition |
|------|------------|
| Draft | A tree of DraftNode objects representing a generated UI layout, produced by the generation pipeline |
| Component Registry | A map of component names to their specs (allowed props, children rules), used for validation and code generation |
| DraftNode | A single node in the draft tree, containing a component type, props, and optional children |
| Overlay Preview | A live-rendered preview of a draft using react-live, shown in the playground UI before export |
| Serialization | Converting a DraftNode tree into copy-pasteable JSX source code |
| Layout Primitives | Base structural components (e.g., Flex, Grid, Stack) available as building blocks in draft generation |
| Chat Panel | The right-side UI panel where users input natural language prompts and see generation results |
| Scope (react-live) | The set of components and utilities exposed to the react-live renderer; only registry-approved components are included |
| Host Application | The existing React application on top of which DraftKit runs as an overlay; DraftKit does not modify the host app's UI |
| AST Validation | Static analysis of generated JSX using @babel/parser to enforce security and registry constraints before rendering |

## Amendment Policy

- Requirements, Define Decision Log, and Glossary are script-managed. Do not hand-edit these sections.
- Add or update requirement rows only via scripted operations.
- Append decision records only via scripted operations.
- Add or update glossary rows only via scripted operations.
- A feature spec may not be opened unless it links to at least one MS-xxx ID.
- Retiring an MS-xxx ID requires updating all linked feature specs.
