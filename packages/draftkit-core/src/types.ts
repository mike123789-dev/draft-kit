export type DraftProps = Record<string, string | number | boolean>;

export type DraftNode = {
  type: string;
  props?: DraftProps;
  children?: DraftNode[];
  text?: string;
};

export type PropDef = {
  type: "string" | "number" | "boolean" | "enum";
  default: string | number | boolean;
  values?: string[];
};

export type ChildrenConstraints = {
  allowed: boolean;
  allowedChildTypes?: string[];
};

export type ComponentSpec = {
  name: string;
  allowedProps: string[];
  propDefs?: Record<string, PropDef>;
  children?: ChildrenConstraints;
  description?: string;
  importPath?: string;
  component?: unknown;
};

export type ComponentRegistry = Record<string, ComponentSpec>;

export type ValidationIssue = {
  path: string;
  message: string;
  line?: number;
  col?: number;
};

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};
