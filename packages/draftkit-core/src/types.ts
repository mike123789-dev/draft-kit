export type DraftProps = Record<string, string | number | boolean>;

export type DraftNode = {
  type: string;
  props?: DraftProps;
  children?: DraftNode[];
  text?: string;
};

export type ComponentSpec = {
  name: string;
  allowedProps: string[];
  description?: string;
};

export type ComponentRegistry = Record<string, ComponentSpec>;

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};
