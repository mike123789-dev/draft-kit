import { parse } from "@babel/parser";
import React from "react";
import { LivePreview, LiveProvider } from "react-live";

import { LAYOUT_PRIMITIVES, type ComponentRegistry } from "@draftkit/core";
import * as Primitives from "./primitives";

// ---------------------------------------------------------------------------
// Scope builder
// ---------------------------------------------------------------------------

const PRIMITIVE_SCOPE: Record<string, unknown> = {};
for (const name of LAYOUT_PRIMITIVES) {
  const comp = (Primitives as Record<string, unknown>)[name];
  if (comp) PRIMITIVE_SCOPE[name] = comp;
}

function buildScope(additionalComponents?: Record<string, unknown>): Record<string, unknown> {
  return { ...PRIMITIVE_SCOPE, ...additionalComponents };
}

export function buildScopeFromRegistry(registry: ComponentRegistry): Record<string, unknown> {
  const fromRegistry: Record<string, unknown> = {};
  for (const spec of Object.values(registry)) {
    if (spec.name && spec.component != null) {
      fromRegistry[spec.name] = spec.component;
    }
  }
  return { ...PRIMITIVE_SCOPE, ...fromRegistry };
}

// ---------------------------------------------------------------------------
// Component name extractor (for pre-render scope check)
// ---------------------------------------------------------------------------

function extractComponentNames(code: string): string[] {
  try {
    const ast = parse(code, { plugins: ["jsx"], sourceType: "module" });
    const names: string[] = [];
    function walk(node: unknown): void {
      if (!node || typeof node !== "object") return;
      const n = node as Record<string, unknown>;
      if (n.type === "JSXOpeningElement") {
        const nameNode = n.name as Record<string, unknown> | undefined;
        if (nameNode?.type === "JSXIdentifier" && typeof nameNode.name === "string") {
          const name = nameNode.name as string;
          // Only capitalised names are React components (lowercase = HTML)
          if (/^[A-Z]/.test(name)) names.push(name);
        }
      }
      for (const key of Object.keys(n)) {
        if (key === "loc" || key === "start" || key === "end") continue;
        const child = n[key];
        if (Array.isArray(child)) child.forEach(walk);
        else if (child && typeof child === "object") walk(child);
      }
    }
    walk(ast);
    return [...new Set(names)];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

export function renderJSX(code: string, scope: Record<string, unknown>): React.ReactElement {
  const missing = extractComponentNames(code).filter((name) => !(name in scope));
  if (missing.length > 0) {
    return React.createElement(
      "div",
      { "data-error": "missing-component" },
      `Error: component(s) not found in scope: ${missing.join(", ")}`
    );
  }

  return React.createElement(LiveProvider, { code, scope }, React.createElement(LivePreview));
}
