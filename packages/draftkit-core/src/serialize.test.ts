import { describe, expect, it } from "vitest";

import { serializeDraftToComponent, serializeDraftToJsx, serializeDraftToJsxExpression } from "./serialize";
import type { ComponentRegistry, DraftNode } from "./types";

const registryWithPaths: ComponentRegistry = {
  Stack: { name: "Stack", allowedProps: ["gap"], importPath: "@draftkit/react" },
  Inline: { name: "Inline", allowedProps: ["gap"], importPath: "@draftkit/react" },
  Button: { name: "Button", allowedProps: ["variant"], importPath: "@mylib/ui" },
  Text: { name: "Text", allowedProps: ["size"] }, // no importPath
};

describe("serializeDraftToJsxExpression", () => {
  it("returns bare JSX with no wrapper or imports", () => {
    const node: DraftNode = { type: "Stack", children: [{ type: "Text", text: "hi" }] };
    const out = serializeDraftToJsxExpression(node);
    expect(out).not.toContain("import");
    expect(out).not.toContain("export default");
    expect(out).toContain("<Stack>");
  });
});

describe("serializeDraftToJsx", () => {
  it("wraps in export default function with no imports", () => {
    const node: DraftNode = { type: "Stack" };
    const out = serializeDraftToJsx(node);
    expect(out).toContain("export default function DraftOutput()");
    expect(out).not.toContain("import");
  });
});

describe("serializeDraftToComponent", () => {
  it("starts with import React from 'react'", () => {
    const node: DraftNode = { type: "Stack" };
    const out = serializeDraftToComponent(node, registryWithPaths);
    expect(out.startsWith('import React from "react";')).toBe(true);
  });

  it("generates named imports grouped by importPath", () => {
    const node: DraftNode = {
      type: "Stack",
      children: [
        { type: "Button" },
        { type: "Inline", children: [{ type: "Text", text: "hi" }] },
      ],
    };
    const out = serializeDraftToComponent(node, registryWithPaths);
    expect(out).toContain('import { Inline, Stack } from "@draftkit/react";');
    expect(out).toContain('import { Button } from "@mylib/ui";');
  });

  it("omits imports for components with no importPath", () => {
    const node: DraftNode = {
      type: "Stack",
      children: [{ type: "Text", text: "hello" }],
    };
    const out = serializeDraftToComponent(node, registryWithPaths);
    // Text has no importPath — must not appear in any import line
    const importLines = out.split("\n").filter((l) => l.startsWith("import"));
    expect(importLines.every((l) => !l.includes("Text"))).toBe(true);
    // but Text still appears in the JSX body
    expect(out).toContain("<Text>");
  });

  it("deduplicates component types used multiple times", () => {
    const node: DraftNode = {
      type: "Stack",
      children: [
        { type: "Button" },
        { type: "Button" },
        { type: "Button" },
      ],
    };
    const out = serializeDraftToComponent(node, registryWithPaths);
    // @mylib/ui import should list Button exactly once
    const uiImport = out.split("\n").find((l) => l.includes("@mylib/ui")) ?? "";
    expect(uiImport).toBe('import { Button } from "@mylib/ui";');
  });

  it("sorts named imports alphabetically within each import statement", () => {
    const node: DraftNode = {
      type: "Inline",
      children: [{ type: "Stack" }],
    };
    const out = serializeDraftToComponent(node, registryWithPaths);
    // Both Inline and Stack are @draftkit/react — should be sorted A→Z
    expect(out).toContain('import { Inline, Stack } from "@draftkit/react";');
  });

  it("handles a single-node tree (no children)", () => {
    const node: DraftNode = { type: "Button" };
    const out = serializeDraftToComponent(node, registryWithPaths);
    expect(out).toContain('import { Button } from "@mylib/ui";');
    expect(out).toContain("export default function DraftOutput()");
  });

  it("emits only React import when all components lack importPath", () => {
    const noPathRegistry: ComponentRegistry = {
      Foo: { name: "Foo", allowedProps: [] },
    };
    const node: DraftNode = { type: "Foo" };
    const out = serializeDraftToComponent(node, noPathRegistry);
    const importLines = out.split("\n").filter((l) => l.startsWith("import"));
    expect(importLines).toHaveLength(1);
    expect(importLines[0]).toBe('import React from "react";');
  });

  it("emits only React import when registry is empty", () => {
    const node: DraftNode = { type: "Stack" };
    const out = serializeDraftToComponent(node, {});
    const importLines = out.split("\n").filter((l) => l.startsWith("import"));
    expect(importLines).toHaveLength(1);
    expect(importLines[0]).toBe('import React from "react";');
  });

  it("collects all types from deeply nested trees", () => {
    const node: DraftNode = {
      type: "Stack",
      children: [
        {
          type: "Inline",
          children: [
            {
              type: "Stack",
              children: [{ type: "Button", children: [{ type: "Text", text: "deep" }] }],
            },
          ],
        },
      ],
    };
    const out = serializeDraftToComponent(node, registryWithPaths);
    expect(out).toContain("Inline");
    expect(out).toContain("Stack");
    expect(out).toContain("Button");
  });

  it("includes export default function DraftOutput wrapper", () => {
    const node: DraftNode = { type: "Stack" };
    const out = serializeDraftToComponent(node, registryWithPaths);
    expect(out).toContain("export default function DraftOutput()");
    expect(out).toContain("return (");
  });
});
