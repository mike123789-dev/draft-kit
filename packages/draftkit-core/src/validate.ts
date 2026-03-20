import { LAYOUT_PRIMITIVES } from "./layout";
import type {
  ComponentRegistry,
  DraftNode,
  ValidationIssue,
  ValidationResult,
} from "./types";

const RAW_HTML_ELEMENTS = new Set([
  "div", "span", "p",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "table", "img", "a",
  "section", "article", "header", "footer", "main", "nav", "aside",
  "form", "input", "button", "textarea", "select", "label",
]);

const LAYOUT_SET = new Set<string>(LAYOUT_PRIMITIVES);
const MAX_LAYOUT_DEPTH = 4;

function walk(
  node: DraftNode,
  path: string,
  registry: ComponentRegistry,
  issues: ValidationIssue[],
  layoutDepth: number,
): void {
  // Raw HTML rejection
  if (RAW_HTML_ELEMENTS.has(node.type)) {
    issues.push({
      path,
      message: `raw HTML element not allowed: ${node.type}`,
    });
    return;
  }

  const spec = registry[node.type];
  if (!spec) {
    issues.push({
      path,
      message: `unknown component: ${node.type}`,
    });
  }

  // Track layout nesting depth
  const isLayout = LAYOUT_SET.has(node.type);
  const currentDepth = isLayout ? layoutDepth + 1 : layoutDepth;

  if (isLayout && currentDepth > MAX_LAYOUT_DEPTH) {
    issues.push({
      path,
      message: `layout nesting depth exceeds ${MAX_LAYOUT_DEPTH}: ${node.type} at depth ${currentDepth}`,
    });
  }

  // Children constraints
  if (spec?.children && !spec.children.allowed && node.children && node.children.length > 0) {
    issues.push({
      path,
      message: `${node.type} does not accept children`,
    });
  }

  // Prop validation
  const props = node.props ?? {};
  for (const key of Object.keys(props)) {
    if (spec && !spec.allowedProps.includes(key)) {
      issues.push({
        path,
        message: `unknown prop on ${node.type}: ${key}`,
      });
      continue;
    }

    // Typed prop validation
    if (spec?.propDefs?.[key]) {
      const def = spec.propDefs[key];
      const value = props[key];

      if (def.type === "enum" && def.values) {
        if (!def.values.includes(String(value))) {
          issues.push({
            path,
            message: `${node.type}.${key}: invalid value "${value}". Allowed: ${def.values.join(", ")}`,
          });
        }
      }

      if (def.type === "number" && typeof value === "number") {
        // Range checks for specific props
        if (key === "gap" && value < 0) {
          issues.push({
            path,
            message: `${node.type}.gap must be non-negative, got ${value}`,
          });
        }
        if (key === "columns" && (value < 1 || !Number.isInteger(value))) {
          issues.push({
            path,
            message: `${node.type}.columns must be a positive integer, got ${value}`,
          });
        }
      }
    }
  }

  node.children?.forEach((child, index) => {
    walk(child, `${path}.${node.type}[${index}]`, registry, issues, currentDepth);
  });
}

export function validateDraft(
  draft: DraftNode,
  registry: ComponentRegistry,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  walk(draft, "root", registry, issues, 0);
  return {
    ok: issues.length === 0,
    issues,
  };
}
