---
doc_type: spec
feature_id: "F-003"
title: "Playground Live Editor"
status: Done
owner: agent
master_spec_id: "MS-019"
ui_impact: true
last_updated: "2026-03-20"
---

# Playground Live Editor

## Objective

Upgrade the DraftKit playground into a live editor: replace the DraftNode tree renderer with the validated react-live engine, add a syntax-highlighted JSX code editor with a manual Run button, and replace the freeform prompt textarea with three preset draft buttons (Mini, Small, Medium) for rapid debug iteration.

## User Stories

- As a developer using the DraftKit playground, I want the preview panel to render JSX through the validated react-live engine so I can see exactly what the validated output looks like before export.
- As a developer, I want to edit the generated JSX directly in a syntax-highlighted editor and apply it to the preview with a Run button so I can iterate on the output without re-generating.
- As a developer, I want one-click preset buttons for small, medium, and larger drafts so I can quickly test the rendering pipeline without typing prompts each time.

## Acceptance Criteria

### Live Preview Engine

- [ ] AC-1 [behavioral]: After generating a draft, the preview panel renders the output of `validateAndRenderJSX(jsxCode, registry)` instead of `renderDraftNode(draft)`. The rendered output reflects what the JSX string describes.
- [ ] AC-2 [behavioral]: When `validateAndRenderJSX` returns `{ ok: true }`, the preview panel displays the rendered React element inside the existing preview container. No error message is shown.
- [ ] AC-3 [behavioral]: When `validateAndRenderJSX` returns `{ ok: false }`, the preview panel displays a human-readable error message inside the preview container (not a JS exception dialog), including at least the first issue's `message` field.
- [ ] AC-4 [behavioral]: The sidebar "Validation:" status line reflects the pipeline result — "검증 통과" when `ok: true`, a message identifying the first issue when `ok: false`.

### Code Editor

- [ ] AC-5 [behavioral]: A syntax-highlighted JSX code editor (using `LiveEditor` from `react-live`) is displayed in the sidebar, showing the current JSX code after a draft is generated or a preset is selected.
- [ ] AC-6 [behavioral]: The code editor is editable. A user can modify the JSX text in the editor freely.
- [ ] AC-7 [behavioral]: A "Run" button is present in the sidebar. Clicking it takes the current editor content, passes it to `validateAndRenderJSX(editorCode, registry)`, and updates the preview panel and Validation status accordingly.
- [ ] AC-8 [behavioral]: Editing the code editor does not update the preview automatically — only clicking Run applies the changes.

### Preset Buttons

- [ ] AC-9 [behavioral]: The freeform prompt textarea is replaced by three preset buttons labeled "Mini", "Small", and "Medium". No freeform text input for prompts is shown.
- [ ] AC-10 [behavioral]: Clicking a preset button generates a hardcoded draft for that size, serializes it to JSX, populates the code editor with the result, and immediately renders it in the preview (equivalent to generate + run in one click).
- [ ] AC-11 [behavioral]: The Mini preset produces a draft with 1–2 components (e.g. a single button or badge). The Small preset produces a draft with 3–5 components (e.g. a card). The Medium preset produces a draft with 6–10 components (e.g. a form or dashboard section).

### Preserved Behavior

- [ ] AC-12 [behavioral]: Before any preset is selected, the preview panel shows the existing placeholder text. The empty state is unchanged.
- [ ] AC-13 [behavioral]: The "Copy JSX" button copies the current editor content to clipboard. It remains functional after edits and after Run.

## Non-Goals

- Modifying `validateAndRenderJSX`, `renderJSX`, or `buildScope` — engine functions from F-002.
- A freeform natural-language prompt input (removed in this feature).
- Live-on-keypress preview updates (Run button is the only trigger).
- Persisting editor content or preview state across page refreshes.
- Modifying PNG export or any behavior not listed above.

## Constraints

- The preview must use `validateAndRenderJSX` from `@draftkit/react` — not a direct call to react-live primitives.
- `LiveEditor` from `react-live` must be used for the code editor — no new editor dependencies.
- No new runtime dependencies beyond those already installed (`react-live`, `@babel/parser`).
- `renderDraftNode` must be removed from the preview render path (not just shadowed).
- The existing visual layout of the preview panel (white card, dashed background) must not change.
- `DraftKitShell` remains in `packages/draftkit-react/src/` — no logic moves to `examples/`.

## Defaults & Assumptions

- The `registry` prop passed to `DraftKitShell` is used for both `validateAndRenderJSX` and preset generation. No additional prop is needed.
- Preset drafts are generated via `createMockDraft` with hardcoded size-appropriate prompts.
- The "Copy JSX" button copies the editor's current text content (not the original serialized draft).

## Dependencies

- F-002 (AST Validation and Restricted Rendering Engine) must be complete: `validateAndRenderJSX` and `buildScope` must be exported from `@draftkit/react`.

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User edits the editor then clicks a preset button | Preset overwrites the editor content; previous edits are discarded |
| User clicks Run with empty editor content | `validateAndRenderJSX` returns empty-string error; preview shows that error message |
| JSX in editor has a syntax error | Preview shows the parse error message from the pipeline; no crash |
| JSX references an unrecognized component | Preview shows "Unrecognized component: X" inline |
| User edits editor, clicks Run, then clicks "Copy JSX" | Copies the edited (run) content, not the original generated JSX |

## Health Metrics

- Existing unit tests for `validateAndRenderJSX`, `buildScope`, and `renderJSX` (F-002) must continue to pass with zero modifications.
- Existing unit tests for `renderDraftNode` (F-001) must continue to pass even if `renderDraftNode` is no longer called in `DraftKitShell`.

## Review Checklist

- [ ] All [NEEDS CLARIFICATION] markers resolved
- [ ] Acceptance criteria are specific and testable
- [ ] Non-goals explicitly stated
- [ ] Constraints are explicit
- [ ] Edge and failure scenarios are covered
