import { parse } from "@babel/parser";
import React from "react";

import {
  checkComponentNames,
  checkForbiddenPatterns,
} from "@draftkit/core";
import type { ComponentRegistry, ValidationIssue } from "@draftkit/core";

import { buildScopeFromRegistry, renderJSX } from "./jsx-renderer";

const MAX_JSX_SIZE = 50_000;

export type PipelineResult =
  | { ok: true; element: React.ReactElement }
  | { ok: false; issues: ValidationIssue[] };

export function validateAndRenderJSX(
  jsxString: string,
  registry: ComponentRegistry,
  validate = true,
): PipelineResult {
  // Pre-checks (size + empty) before touching the parser
  if (jsxString.trim().length === 0) {
    return { ok: false, issues: [{ path: "", message: "JSX string is empty or contains no meaningful content" }] };
  }
  if (jsxString.length > MAX_JSX_SIZE) {
    return { ok: false, issues: [{ path: "", message: `JSX string exceeds maximum size limit of ${MAX_JSX_SIZE} characters` }] };
  }

  // Parse once — reuse AST for all checks
  let ast: ReturnType<typeof parse>;
  try {
    ast = parse(jsxString, { plugins: ["jsx"], sourceType: "module" });
  } catch (e: unknown) {
    const err = e as { message: string; loc?: { line: number; column: number } };
    return { ok: false, issues: [{ path: "", message: err.message, line: err.loc?.line, col: err.loc?.column }] };
  }

  if (validate) {
    const forbiddenIssues = checkForbiddenPatterns(ast);
    if (forbiddenIssues.length > 0) return { ok: false, issues: forbiddenIssues };

    const componentIssues = checkComponentNames(ast, registry);
    if (componentIssues.length > 0) return { ok: false, issues: componentIssues };
  }

  return { ok: true, element: renderJSX(jsxString, buildScopeFromRegistry(registry)) };
}
