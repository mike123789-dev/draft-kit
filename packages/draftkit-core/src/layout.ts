import type { ComponentRegistry } from "./types";

export const LAYOUT_PRIMITIVES = [
  "Page",
  "Section",
  "Container",
  "Stack",
  "Inline",
  "Grid",
  "Spacer",
  "Divider",
] as const;

const ALIGN_VALUES = ["start", "center", "end", "stretch"] as const;
const JUSTIFY_VALUES = [
  "start",
  "center",
  "end",
  "space-between",
  "space-around",
  "space-evenly",
] as const;

export const defaultRegistry: ComponentRegistry = {
  Page: {
    name: "Page",
    allowedProps: ["padding", "background"],
    propDefs: {
      padding: { type: "number", default: 0 },
      background: { type: "string", default: "var(--background)" },
    },
    children: { allowed: true },
    importPath: "@draftkit/react",
  },
  Section: {
    name: "Section",
    allowedProps: ["paddingY", "background"],
    propDefs: {
      paddingY: { type: "number", default: 0 },
      background: { type: "string", default: "transparent" },
    },
    children: { allowed: true },
    importPath: "@draftkit/react",
  },
  Container: {
    name: "Container",
    allowedProps: ["maxWidth", "paddingX"],
    propDefs: {
      maxWidth: { type: "number", default: 960 },
      paddingX: { type: "number", default: 0 },
    },
    children: { allowed: true },
    importPath: "@draftkit/react",
  },
  Stack: {
    name: "Stack",
    allowedProps: ["gap", "align", "justify"],
    propDefs: {
      gap: { type: "number", default: 12 },
      align: { type: "enum", default: "stretch", values: [...ALIGN_VALUES] },
      justify: { type: "enum", default: "start", values: [...JUSTIFY_VALUES] },
    },
    children: { allowed: true },
    importPath: "@draftkit/react",
  },
  Inline: {
    name: "Inline",
    allowedProps: ["gap", "align", "justify", "wrap"],
    propDefs: {
      gap: { type: "number", default: 12 },
      align: { type: "enum", default: "center", values: [...ALIGN_VALUES] },
      justify: { type: "enum", default: "start", values: [...JUSTIFY_VALUES] },
      wrap: { type: "boolean", default: true },
    },
    children: { allowed: true },
    importPath: "@draftkit/react",
  },
  Grid: {
    name: "Grid",
    allowedProps: ["columns", "gap"],
    propDefs: {
      columns: { type: "number", default: 1 },
      gap: { type: "number", default: 12 },
    },
    children: { allowed: true },
    importPath: "@draftkit/react",
  },
  Spacer: {
    name: "Spacer",
    allowedProps: ["size"],
    propDefs: {
      size: { type: "number", default: 8 },
    },
    children: { allowed: false },
    importPath: "@draftkit/react",
  },
  Divider: {
    name: "Divider",
    allowedProps: ["marginY"],
    propDefs: {
      marginY: { type: "number", default: 0 },
    },
    children: { allowed: false },
    importPath: "@draftkit/react",
  },
  Card: { name: "Card", allowedProps: [], children: { allowed: true } },
  CardHeader: { name: "CardHeader", allowedProps: [], children: { allowed: true } },
  CardTitle: { name: "CardTitle", allowedProps: [], children: { allowed: true } },
  CardDescription: { name: "CardDescription", allowedProps: [], children: { allowed: true } },
  CardContent: { name: "CardContent", allowedProps: [], children: { allowed: true } },
  Button: { name: "Button", allowedProps: ["variant", "size"] },
  Badge: { name: "Badge", allowedProps: ["variant"] },
  Input: { name: "Input", allowedProps: ["placeholder"] },
  Text: { name: "Text", allowedProps: ["size", "weight", "tone"] },
};
