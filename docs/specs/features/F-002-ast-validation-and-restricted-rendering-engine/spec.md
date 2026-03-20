---
doc_type: spec
feature_id: "F-002"
title: "AST Validation and Restricted Rendering Engine"
status: Done
owner: agent
master_spec_id: "MS-011"
ui_impact: false
last_updated: "2026-03-20"
---

# AST Validation and Restricted Rendering Engine

## Objective

Provide a JSX string validation pipeline that parses generated JSX into an AST, enforces security and registry rules (no imports, no global access, no arbitrary JS, only registered components and props), and renders validated JSX through a restricted rendering engine with a scoped component whitelist. This prevents execution of untrusted code while enabling safe live preview of AI-generated UI.

## User Stories

- As a developer integrating DraftKit, I want generated JSX to be validated against the component registry before rendering so that only known, safe components appear in the preview.
- As a developer integrating DraftKit, I want JSX containing forbidden patterns (imports, global access, hooks, async logic) to be rejected with clear error messages so that I can debug generation issues.
- As a developer integrating DraftKit, I want a single pipeline function that takes a JSX string and registry and returns either rendered output or a structured error so that integration is straightforward.

## Acceptance Criteria

- [ ] AC-1 [behavioral]: Given a JSX string, the validator parses it into an AST. When the JSX has syntax errors, the validator returns a validation error containing the line number and column number of the first parse failure.
- [ ] AC-2 [behavioral]: Given a JSX string containing an `import` or `export` statement, the validator rejects it and the error message includes the keyword (`import` or `export`) and the line number where it was found.
- [ ] AC-3 [behavioral]: Given a JSX string containing a reference to any of `window`, `document`, `globalThis`, `eval`, `Function` (as constructor), `setTimeout`, or `setInterval`, the validator rejects it and the error message identifies which forbidden global was referenced.
- [ ] AC-4 [behavioral]: Given a JSX string and a component registry, the validator accepts JSX that uses only component names present in the registry (including layout primitives). When the JSX references a component name not in the registry, the validator rejects it and the error message includes the unrecognized component name.
- [ ] AC-5 [behavioral]: Given a JSX string containing a call or reference to `useState`, `useEffect`, `useReducer`, `useRef`, `useMemo`, `useCallback`, `useContext`, or any identifier matching the React hook naming convention (starts with `use` followed by an uppercase letter), the validator rejects it and the error message identifies the hook name.
- [ ] AC-6 [behavioral]: Given a JSX string containing `async`, `await`, `fetch(`, or `XMLHttpRequest`, the validator rejects it and the error message identifies the forbidden pattern.
- [ ] AC-7 [behavioral]: The rendering engine renders validated JSX with a scope object containing only registry-approved components (layout primitives and registered UI components). Components not included in the scope are not available during rendering.
- [ ] AC-8 [behavioral]: When validated JSX references a component name that passes AST validation but is not provided in the rendering scope (e.g., removed between validation and render), the rendering engine produces an explicit error rather than rendering `undefined` or an empty element.
- [ ] AC-9 [behavioral]: A pipeline function exists that accepts a JSX string and a component registry, runs AST validation, and if valid, returns a renderable element. If invalid, it returns a structured error object containing an array of validation issues (each with a message and location). The function does not throw exceptions for validation failures.
- [ ] AC-10 [behavioral]: The existing `validateDraft()` function (DraftNode tree validation) continues to work with its current API and behavior. The new JSX string validation is an additional export, not a modification of `validateDraft()`.

## Non-Goals

- Full JavaScript sandboxing or runtime isolation (AST validation is a static analysis gate, not a sandbox).
- Content Security Policy (CSP) header enforcement.
- Runtime memory or CPU limits on rendered components.
- TypeScript syntax support within JSX strings (only standard JSX).
- Multi-file or multi-module JSX support (each validation call handles a single JSX string).
- Visual regression testing infrastructure.
- Modifying or replacing the existing DraftNode tree validation from F-001.

## Constraints

- AST validation logic must reside in `@draftkit/core` (framework-agnostic).
- Rendering engine integration must reside in `@draftkit/react`.
- No new runtime dependencies beyond those already installed (`react-live@4.1.8`, `@babel/parser@7.29.2`).
- Dependency direction must be maintained: `core` must not import from `react` or `next`.
- The forbidden-pattern list (globals, hooks, async) must be configurable via a data structure, not hardcoded in branching logic, so it can be extended without code changes.

## Defaults & Assumptions

- Maximum JSX string length before rejection: 50KB (50,000 characters). Strings exceeding this limit are rejected without parsing.
- AST parsing is synchronous. No validation timeout is imposed because `@babel/parser` completes in negligible time for strings under 50KB.
- The JSX dialect supported is standard JSX (React-flavored) without TypeScript type annotations.
- Fragment syntax (`<>...</>`) is allowed and treated as valid JSX structure.
- Inline style objects (`style={{ color: 'red' }}`) are allowed; they are validated for forbidden references but not blocked as a pattern.
- Layout primitives (Stack, Row, Grid, Container, Spacer) are always implicitly included in the allowed component set alongside the explicit registry.

## Dependencies

- F-001 (DraftNode validation and component registry) must be complete: the registry data structure and `validateDraft()` function are prerequisites.
- A component registry must be populated with at least one component for the pipeline to be useful. The validation function accepts the registry as a parameter; it does not depend on a global singleton.

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty string (`""`) | Validation returns an error: JSX string is empty. |
| Whitespace-only string (`"   \n  "`) | Validation returns an error: JSX string contains no meaningful content. |
| Self-closing tags (`<Button />`) | Parsed and validated normally; self-closing is valid JSX. |
| Fragment syntax (`<>text</>`) | Parsed and validated normally; fragments are allowed. |
| Nested JSX expressions (`{1 + 1}`) | Parsed normally. Expressions are checked for forbidden references but simple arithmetic is allowed. |
| String literals in JSX (`{"hello"}`) | Allowed; no forbidden pattern present. |
| Comments in JSX (`{/* comment */}`) | Parsed normally; comments are allowed and ignored during validation. |
| JSX string exceeding 50KB | Rejected immediately with a size-limit error before parsing is attempted. |
| Inline style objects (`style={{ color: 'red' }}`) | Allowed; the object literal is checked for forbidden references but `style` props are not blocked. |
| JSX referencing an undefined variable (not a component, not forbidden) | Passes AST validation (validation checks component names and forbidden patterns, not variable resolution). May produce a runtime error during rendering; the rendering engine surfaces this as an error, not a crash. |
| Deeply nested JSX (100+ levels) | Parsed by the AST parser. No explicit depth limit is imposed at the JSX string level (DraftNode depth limits are a separate concern in F-001). |
| JSX with event handler props (`onClick={...}`) | The expression inside the handler is checked for forbidden patterns. If it references forbidden globals or hooks, it is rejected. Simple inline expressions are allowed. |
| Obfuscated global access (`window["doc" + "ument"]`) | Not caught by static AST validation. This is a known limitation; full sandboxing is a non-goal. |
| JSX with template literals containing forbidden patterns | Template literal expressions are traversed; forbidden references inside template expressions are caught. |

## Health Metrics

- Existing `validateDraft()` unit tests must continue to pass with zero modifications.
- Parsing and validation of a 10KB JSX string must complete in under 100ms on CI hardware.

## Review Checklist

- [x] All [NEEDS CLARIFICATION] markers resolved
- [x] Acceptance criteria are specific and testable
- [x] Non-goals explicitly stated
- [x] Constraints are explicit
- [x] Edge and failure scenarios are covered
