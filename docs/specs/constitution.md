# Constitution

This document defines project principles that should not be violated without explicit justification.

## Article 1: Spec First

- Write or update a related spec before implementation code.
- Keep requirements testable and explicit.

## Article 2: Test Driven Development

- Start with a failing test (RED).
- Implement minimal code to pass (GREEN).
- Refactor safely while tests stay green (REFACTOR).

## Article 3: Traceable Delivery

- Every task maps to acceptance criteria.
- Every acceptance criterion maps to a test.

## Article 4: Learning Capture

- Feature completion requires at least a minimal compound entry.
- Reusable patterns and decisions should be recorded.

## Article 5: Monorepo Boundaries & Dependency Direction

This article enforces the rules defined in `AGENTS.md` at the repository root.

- `@draftkit/core` is framework-agnostic: no imports from `react`, `next`, or app code.
- `@draftkit/react` may import `core` but never `next` or app code.
- `@draftkit/next` may import `core` (and optionally `react` wrappers) but no reverse imports.
- `examples/*` can import all packages but must never contain core product logic.
- UI component source-of-truth is `examples/playground-next/src/components`; do not create a separate package-level UI library unless explicitly decided.
- Start feature work in `core` first, then wire in `react`, then verify in `playground`.

## Amendment Policy

- Changes require owner + reviewer acknowledgement.
- If an article is temporarily bypassed, record scope, reason, and expiry date.
