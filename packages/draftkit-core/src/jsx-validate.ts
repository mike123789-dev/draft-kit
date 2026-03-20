import { parse } from "@babel/parser";

import { LAYOUT_PRIMITIVES } from "./layout";
import type { ComponentRegistry, ValidationIssue, ValidationResult } from "./types";

const MAX_JSX_SIZE = 50_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ASTNode = Record<string, unknown>;
type ParsedFile = ReturnType<typeof parse>;

// ---------------------------------------------------------------------------
// Simple recursive AST walker (no @babel/traverse dependency)
// ---------------------------------------------------------------------------

const SKIP_KEYS = new Set(["type", "loc", "start", "end", "extra", "innerComments", "leadingComments", "trailingComments"]);

function walk(node: unknown, visitor: (node: ASTNode) => void): void {
  if (!node || typeof node !== "object") return;
  const n = node as ASTNode;
  if (typeof n.type === "string") visitor(n);
  for (const key of Object.keys(n)) {
    if (SKIP_KEYS.has(key)) continue;
    const child = n[key];
    if (Array.isArray(child)) {
      for (const item of child) walk(item, visitor);
    } else if (child && typeof child === "object") {
      walk(child, visitor);
    }
  }
}

function loc(node: ASTNode): { line?: number; col?: number } {
  const l = node.loc as { start?: { line: number; column: number } } | undefined;
  return { line: l?.start?.line, col: l?.start?.column };
}

// ---------------------------------------------------------------------------
// Forbidden pattern rules (data-driven, extensible)
// ---------------------------------------------------------------------------

const FORBIDDEN_GLOBALS = new Set([
  "window", "document", "globalThis", "eval", "Function", "setTimeout", "setInterval",
]);

const NAMED_HOOKS = new Set([
  "useState", "useEffect", "useReducer", "useRef", "useMemo", "useCallback", "useContext",
]);

const HOOK_RE = /^use[A-Z]/;

const ASYNC_IDENTIFIERS = new Set(["fetch", "XMLHttpRequest"]);

type PatternRule = {
  test: (node: ASTNode) => string | null;
  message: (match: string, node: ASTNode) => string;
};

const PATTERN_RULES: PatternRule[] = [
  // AC-2: import declarations
  {
    test: (n) => (n.type === "ImportDeclaration" ? "import" : null),
    message: (_, n) => `Forbidden keyword: import (line ${(n.loc as { start?: { line: number } } | undefined)?.start?.line ?? "?"})`,
  },
  // AC-2: export declarations
  {
    test: (n) =>
      n.type === "ExportDefaultDeclaration" ||
      n.type === "ExportNamedDeclaration" ||
      n.type === "ExportAllDeclaration"
        ? "export"
        : null,
    message: (_, n) => `Forbidden keyword: export (line ${(n.loc as { start?: { line: number } } | undefined)?.start?.line ?? "?"})`,
  },
  // AC-3: forbidden globals
  {
    test: (n) =>
      n.type === "Identifier" && typeof n.name === "string" && FORBIDDEN_GLOBALS.has(n.name)
        ? n.name as string
        : null,
    message: (match) => `Forbidden global reference: ${match}`,
  },
  // AC-5: React hooks (named + convention)
  {
    test: (n) =>
      n.type === "Identifier" &&
      typeof n.name === "string" &&
      (NAMED_HOOKS.has(n.name) || HOOK_RE.test(n.name))
        ? n.name as string
        : null,
    message: (match) => `Forbidden hook reference: ${match}`,
  },
  // AC-6: async function expressions / declarations
  {
    test: (n) =>
      (n.type === "ArrowFunctionExpression" || n.type === "FunctionExpression" || n.type === "FunctionDeclaration") &&
      n.async === true
        ? "async"
        : null,
    message: () => `Forbidden keyword: async`,
  },
  // AC-6: await expressions
  {
    test: (n) => (n.type === "AwaitExpression" ? "await" : null),
    message: () => `Forbidden keyword: await`,
  },
  // AC-6: fetch / XMLHttpRequest identifiers
  {
    test: (n) =>
      n.type === "Identifier" && typeof n.name === "string" && ASYNC_IDENTIFIERS.has(n.name)
        ? n.name as string
        : null,
    message: (match) => `Forbidden identifier: ${match}`,
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const LAYOUT_PRIMITIVES_SET = new Set<string>(LAYOUT_PRIMITIVES);

export function checkComponentNames(ast: ParsedFile, registry: ComponentRegistry): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  walk(ast, (node) => {
    if (node.type !== "JSXOpeningElement") return;
    const nameNode = node.name as ASTNode;
    // Fragment: JSXOpeningFragment has no name node at this level; JSXOpeningElement with JSXIdentifier
    if (!nameNode || nameNode.type !== "JSXIdentifier") return;
    const name = nameNode.name as string;
    if (LAYOUT_PRIMITIVES_SET.has(name) || name in registry) return;
    issues.push({ path: "", message: `Unrecognized component: ${name}`, ...loc(node) });
  });
  return issues;
}

export function checkForbiddenPatterns(ast: ParsedFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  walk(ast, (node) => {
    for (const rule of PATTERN_RULES) {
      const match = rule.test(node);
      if (match !== null) {
        issues.push({ path: "", message: rule.message(match, node), ...loc(node) });
        break; // one issue per node
      }
    }
  });
  return issues;
}

export function parseJSX(jsxString: string, _registry: ComponentRegistry): ValidationResult {
  if (jsxString.trim().length === 0) {
    return { ok: false, issues: [{ path: "", message: "JSX string is empty or contains no meaningful content" }] };
  }

  if (jsxString.length > MAX_JSX_SIZE) {
    return {
      ok: false,
      issues: [{ path: "", message: `JSX string exceeds maximum size limit of ${MAX_JSX_SIZE} characters` }],
    };
  }

  try {
    parse(jsxString, { plugins: ["jsx"], sourceType: "module" });
    return { ok: true, issues: [] };
  } catch (e: unknown) {
    const err = e as { message: string; loc?: { line: number; column: number } };
    return {
      ok: false,
      issues: [
        {
          path: "",
          message: err.message,
          line: err.loc?.line,
          col: err.loc?.column,
        },
      ],
    };
  }
}
