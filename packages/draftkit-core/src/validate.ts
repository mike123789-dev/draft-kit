import type {
  ComponentRegistry,
  DraftNode,
  ValidationIssue,
  ValidationResult,
} from "./types";

function walk(
  node: DraftNode,
  path: string,
  registry: ComponentRegistry,
  issues: ValidationIssue[],
): void {
  const spec = registry[node.type];
  if (!spec) {
    issues.push({
      path,
      message: `허용되지 않은 컴포넌트입니다: ${node.type}`,
    });
  }

  const props = node.props ?? {};
  for (const key of Object.keys(props)) {
    if (spec && !spec.allowedProps.includes(key)) {
      issues.push({
        path,
        message: `${node.type}의 허용되지 않은 prop: ${key}`,
      });
    }
  }

  node.children?.forEach((child, index) => {
    walk(child, `${path}.${node.type}[${index}]`, registry, issues);
  });
}

export function validateDraft(
  draft: DraftNode,
  registry: ComponentRegistry,
): ValidationResult {
  const issues: ValidationIssue[] = [];
  walk(draft, "root", registry, issues);
  return {
    ok: issues.length === 0,
    issues,
  };
}
