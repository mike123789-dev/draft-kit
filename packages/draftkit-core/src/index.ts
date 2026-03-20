export { createMockDraft } from "./mock-generator";
export { checkComponentNames, checkForbiddenPatterns, parseJSX } from "./jsx-validate";
export { defaultRegistry, LAYOUT_PRIMITIVES } from "./layout";
export { serializeDraftToComponent, serializeDraftToJsx, serializeDraftToJsxExpression } from "./serialize";
export { validateDraft } from "./validate";

export type {
  ChildrenConstraints,
  ComponentRegistry,
  ComponentSpec,
  DraftNode,
  DraftProps,
  PropDef,
  ValidationIssue,
  ValidationResult,
} from "./types";
