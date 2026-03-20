import type { ComponentRegistry, DraftNode } from "./types";

function toPropsString(props: DraftNode["props"]): string {
  if (!props) return "";

  const entries = Object.entries(props).map(([key, value]) => {
    if (typeof value === "string") {
      return `${key}="${value}"`;
    }
    return `${key}={${String(value)}}`;
  });
  return entries.length > 0 ? ` ${entries.join(" ")}` : "";
}

function toJsx(node: DraftNode, depth: number): string {
  const pad = "  ".repeat(depth);
  const props = toPropsString(node.props);
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const hasText = Boolean(node.text);

  if (!hasChildren && !hasText) {
    return `${pad}<${node.type}${props} />`;
  }

  const lines = [`${pad}<${node.type}${props}>`];
  if (node.text) {
    lines.push(`${pad}  ${node.text}`);
  }
  if (node.children) {
    for (const child of node.children) {
      lines.push(toJsx(child, depth + 1));
    }
  }
  lines.push(`${pad}</${node.type}>`);
  return lines.join("\n");
}

export function serializeDraftToJsx(node: DraftNode): string {
  return [
    "export default function DraftOutput() {",
    "  return (",
    toJsx(node, 2),
    "  );",
    "}",
  ].join("\n");
}

/** Returns bare JSX expression (no function wrapper) — use for live preview pipelines. */
export function serializeDraftToJsxExpression(node: DraftNode): string {
  return toJsx(node, 0);
}

function collectComponentTypes(node: DraftNode): string[] {
  const types = new Set<string>();
  function walk(n: DraftNode) {
    types.add(n.type);
    n.children?.forEach(walk);
  }
  walk(node);
  return [...types];
}

/** Returns a complete single-file React component with import statements derived from the registry. */
export function serializeDraftToComponent(node: DraftNode, registry: ComponentRegistry): string {
  const types = collectComponentTypes(node);
  const byPath = new Map<string, string[]>();
  for (const type of types) {
    const spec = registry[type];
    if (spec?.importPath) {
      const group = byPath.get(spec.importPath) ?? [];
      group.push(type);
      byPath.set(spec.importPath, group);
    }
  }
  const lines: string[] = ['import React from "react";'];
  for (const [path, names] of [...byPath.entries()].sort()) {
    lines.push(`import { ${names.sort().join(", ")} } from "${path}";`);
  }
  lines.push("", serializeDraftToJsx(node));
  return lines.join("\n");
}
