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

export const defaultRegistry: ComponentRegistry = {
  Page: { name: "Page", allowedProps: ["padding", "background"] },
  Section: { name: "Section", allowedProps: ["paddingY", "background"] },
  Container: { name: "Container", allowedProps: ["maxWidth", "paddingX"] },
  Stack: { name: "Stack", allowedProps: ["gap", "align", "justify"] },
  Inline: { name: "Inline", allowedProps: ["gap", "align", "wrap"] },
  Grid: { name: "Grid", allowedProps: ["columns", "gap"] },
  Spacer: { name: "Spacer", allowedProps: ["size"] },
  Divider: { name: "Divider", allowedProps: ["marginY"] },
  Card: { name: "Card", allowedProps: ["title", "description"] },
  Button: { name: "Button", allowedProps: ["variant", "size"] },
  Badge: { name: "Badge", allowedProps: ["variant"] },
  Input: { name: "Input", allowedProps: ["placeholder"] },
  Text: { name: "Text", allowedProps: ["size", "weight", "tone"] },
};
