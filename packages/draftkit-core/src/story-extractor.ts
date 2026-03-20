import { parse } from "@babel/parser";

import type { ComponentRegistry, ComponentSpec, PropDef } from "./types";

// ---------------------------------------------------------------------------
// Internal AST helpers (Record<string, unknown> typing — no @babel/types dep)
// ---------------------------------------------------------------------------

type ASTNode = Record<string, unknown>;

function parseStoryFile(content: string): ASTNode | null {
  try {
    const result = parse(content, {
      plugins: ["jsx", "typescript"],
      sourceType: "module",
    });
    return result as unknown as ASTNode;
  } catch {
    return null;
  }
}

/** Unwrap TS wrapper expressions (TSAsExpression, TSSatisfiesExpression, TSTypeAssertion) */
function unwrapTS(node: ASTNode): ASTNode {
  while (
    node.type === "TSAsExpression" ||
    node.type === "TSSatisfiesExpression" ||
    node.type === "TSTypeAssertion"
  ) {
    node = node.expression as ASTNode;
  }
  return node;
}

/** Get a named property from an ObjectExpression node. */
function getProp(obj: ASTNode, key: string): ASTNode | null {
  const props = obj.properties as ASTNode[] | undefined;
  if (!Array.isArray(props)) return null;
  for (const prop of props) {
    if (prop.type !== "ObjectProperty") continue;
    const k = prop.key as ASTNode;
    const name =
      k.type === "Identifier" ? (k.name as string)
      : k.type === "StringLiteral" ? (k.value as string)
      : null;
    if (name === key) return prop.value as ASTNode;
  }
  return null;
}

/** Get a nested ObjectExpression by successive key lookups. */
function getNestedObj(node: ASTNode, ...keys: string[]): ASTNode | null {
  let cur: ASTNode = node;
  for (const key of keys) {
    const child = getProp(cur, key);
    if (!child) return null;
    const unwrapped = unwrapTS(child);
    if (unwrapped.type !== "ObjectExpression") return null;
    cur = unwrapped;
  }
  return cur;
}

/** Extract a string value from a StringLiteral or single-quasi TemplateLiteral node. */
function getString(node: ASTNode | null | undefined): string | undefined {
  if (!node) return undefined;
  if (node.type === "StringLiteral") return node.value as string;
  if (node.type === "TemplateLiteral") {
    const quasis = node.quasis as ASTNode[] | undefined;
    const exprs = node.expressions as ASTNode[] | undefined;
    if (quasis?.length === 1 && (!exprs || exprs.length === 0)) {
      const cooked = (quasis[0].value as ASTNode | undefined)?.cooked;
      return typeof cooked === "string" ? cooked : undefined;
    }
  }
  return undefined;
}

/** Extract a literal value (string | number | boolean) from a node. */
function getLiteral(node: ASTNode | null | undefined): string | number | boolean | undefined {
  if (!node) return undefined;
  if (node.type === "StringLiteral") return node.value as string;
  if (node.type === "NumericLiteral") return node.value as number;
  if (node.type === "BooleanLiteral") return node.value as boolean;
  if (node.type === "TemplateLiteral") {
    const quasis = node.quasis as ASTNode[] | undefined;
    const exprs = node.expressions as ASTNode[] | undefined;
    if (quasis?.length === 1 && (!exprs || exprs.length === 0)) {
      const cooked = (quasis[0].value as ASTNode | undefined)?.cooked;
      return typeof cooked === "string" ? cooked : undefined;
    }
  }
  return undefined;
}

/** Find the ObjectExpression of the default export's meta object. */
function findMetaObject(ast: ASTNode): ASTNode | null {
  const body = ((ast as ASTNode).program as ASTNode | undefined)?.body as ASTNode[] | undefined;
  if (!Array.isArray(body)) return null;

  // Collect top-level variable declarations: name → ObjectExpression
  const variables = new Map<string, ASTNode>();
  for (const stmt of body) {
    if (stmt.type !== "VariableDeclaration") continue;
    const decls = stmt.declarations as ASTNode[] | undefined;
    if (!Array.isArray(decls)) continue;
    for (const decl of decls) {
      const declId = decl.id as ASTNode | undefined;
      if (!decl.init || declId?.type !== "Identifier") continue;
      const init = unwrapTS(decl.init as ASTNode);
      if (init.type === "ObjectExpression") {
        variables.set(declId.name as string, init);
      }
    }
  }

  // Find the ExportDefaultDeclaration
  for (const stmt of body) {
    if (stmt.type !== "ExportDefaultDeclaration") continue;
    const decl = unwrapTS(stmt.declaration as ASTNode);
    if (decl.type === "ObjectExpression") return decl;
    if (decl.type === "Identifier") return variables.get(decl.name as string) ?? null;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Control type mapping
// ---------------------------------------------------------------------------

const CONTROL_TYPE_MAP: Record<string, PropDef["type"]> = {
  select: "enum",
  boolean: "boolean",
  text: "string",
  number: "number",
};

/** Extract control type string from control value — handles both string and object forms. */
function getControlType(controlNode: ASTNode): string | null {
  if (controlNode.type === "StringLiteral") return controlNode.value as string;
  if (controlNode.type === "ObjectExpression") {
    const typeVal = getProp(controlNode, "type");
    if (typeVal?.type === "StringLiteral") return typeVal.value as string;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a story file's content and extract a ComponentSpec from the default
 * export's meta object. Returns null if the file has no `parameters.draftkit`
 * block or if `componentName` is missing.
 *
 * The returned spec never has a `component` field — that is the host
 * application's responsibility (F-005 pattern).
 */
export function extractSpecFromStory(fileContent: string): ComponentSpec | null {
  const ast = parseStoryFile(fileContent);
  if (!ast) return null;

  const metaObj = findMetaObject(ast);
  if (!metaObj) return null;

  // parameters.draftkit block is required
  const draftkitObj = getNestedObj(metaObj, "parameters", "draftkit");
  if (!draftkitObj) return null;

  // componentName is required — it becomes the registry key
  const name = getString(getProp(draftkitObj, "componentName"));
  if (!name) return null;

  const description = getString(getProp(draftkitObj, "description"));
  const importPath = getString(getProp(draftkitObj, "importPath"));

  // argTypes → allowedProps + propDefs
  const argTypesObj = (() => {
    const node = getProp(metaObj, "argTypes");
    if (!node) return null;
    const u = unwrapTS(node);
    return u.type === "ObjectExpression" ? u : null;
  })();

  const argsObj = (() => {
    const node = getProp(metaObj, "args");
    if (!node) return null;
    const u = unwrapTS(node);
    return u.type === "ObjectExpression" ? u : null;
  })();

  const allowedProps: string[] = [];
  const propDefs: Record<string, PropDef> = {};

  if (argTypesObj) {
    const props = argTypesObj.properties as ASTNode[] | undefined;
    if (Array.isArray(props)) {
      for (const prop of props) {
        if (prop.type !== "ObjectProperty") continue;
        const keyNode = prop.key as ASTNode;
        const propKey =
          keyNode.type === "Identifier" ? (keyNode.name as string)
          : keyNode.type === "StringLiteral" ? (keyNode.value as string)
          : null;
        if (!propKey) continue;

        const propValueNode = unwrapTS(prop.value as ASTNode);
        if (propValueNode.type !== "ObjectExpression") {
          // Non-object argType entry — include in allowedProps, no propDef
          allowedProps.push(propKey);
          continue;
        }

        // Skip action-type props (onClick, etc.)
        const actionProp = getProp(propValueNode, "action");
        if (actionProp !== null) continue;

        allowedProps.push(propKey);

        // Extract control type
        const controlNode = getProp(propValueNode, "control");
        if (!controlNode) continue;

        const controlType = getControlType(controlNode);
        if (!controlType) continue;

        const mappedType = CONTROL_TYPE_MAP[controlType];
        if (!mappedType) continue; // unknown control type — keep in allowedProps, skip propDef

        // Default value from args
        const defaultVal = argsObj ? getLiteral(getProp(argsObj, propKey)) : undefined;

        const def: Partial<PropDef> & { type: PropDef["type"] } = { type: mappedType };
        if (defaultVal !== undefined) def.default = defaultVal;

        // enum options
        if (mappedType === "enum") {
          const optionsNode = getProp(propValueNode, "options");
          if (optionsNode?.type === "ArrayExpression") {
            const elements = optionsNode.elements as ASTNode[] | undefined;
            if (Array.isArray(elements)) {
              const values = elements
                .map((el) => getString(el))
                .filter((v): v is string => v !== undefined);
              if (values.length > 0) (def as Record<string, unknown>).values = values;
            }
          }
        }

        propDefs[propKey] = def as PropDef;
      }
    }
  }

  // Build spec — component field must be ABSENT (not set to undefined)
  const spec: ComponentSpec = { name, allowedProps };
  if (Object.keys(propDefs).length > 0) spec.propDefs = propDefs;
  if (description !== undefined) spec.description = description;
  if (importPath !== undefined) spec.importPath = importPath;

  return spec;
}

/**
 * Read multiple story files and return a ComponentRegistry assembled from
 * all non-null extraction results. Files that fail to parse or lack a
 * `parameters.draftkit` block are silently skipped.
 */
export async function extractRegistryFromStories(filePaths: string[]): Promise<ComponentRegistry> {
  if (filePaths.length === 0) return {};
  // Dynamic import keeps node:fs/promises out of browser bundles
  const { readFile } = await import("node:fs/promises");
  const registry: ComponentRegistry = {};
  for (const filePath of filePaths) {
    try {
      const content = await readFile(filePath, "utf-8");
      const spec = extractSpecFromStory(content);
      if (spec) {
        registry[spec.name] = spec;
      }
    } catch {
      // File missing or unreadable — skip silently
    }
  }
  return registry;
}
