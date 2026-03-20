import type { DraftNode } from "./types";

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
