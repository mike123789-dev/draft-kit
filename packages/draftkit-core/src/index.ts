export { createMockDraft } from "./mock-generator";
export { defaultRegistry, LAYOUT_PRIMITIVES } from "./layout";
export { serializeDraftToJsx } from "./serialize";
export { validateDraft } from "./validate";

export type {
  ComponentRegistry,
  ComponentSpec,
  DraftNode,
  DraftProps,
  ValidationIssue,
  ValidationResult,
} from "./types";
