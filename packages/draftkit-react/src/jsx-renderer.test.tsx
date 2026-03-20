import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ComponentRegistry } from "@draftkit/core";
import { buildScopeFromRegistry, renderJSX } from "./jsx-renderer";
import { Stack } from "./primitives";

describe("buildScopeFromRegistry — AC-7 layout primitives always in scope (legacy)", () => {
  it("includes all 8 layout primitives", () => {
    const scope = buildScopeFromRegistry({});
    for (const name of ["Page", "Section", "Container", "Stack", "Inline", "Grid", "Spacer", "Divider"]) {
      expect(scope, `${name} should be in scope`).toHaveProperty(name);
    }
  });

  it("merges registry components into scope alongside primitives", () => {
    const MyButton = () => <button />;
    const scope = buildScopeFromRegistry({ MyButton: { name: "MyButton", allowedProps: [], component: MyButton } });
    expect(scope).toHaveProperty("MyButton");
    expect(scope).toHaveProperty("Stack");
  });

  it("scope values are callable (React components)", () => {
    const scope = buildScopeFromRegistry({});
    expect(typeof scope["Stack"]).toBe("function");
  });
});

// F-005 AC-2, AC-3, AC-8, AC-9
describe("buildScopeFromRegistry — always includes layout primitives (AC-9)", () => {
  it("empty registry returns all 8 primitives", () => {
    const scope = buildScopeFromRegistry({});
    for (const name of ["Page", "Section", "Container", "Stack", "Inline", "Grid", "Spacer", "Divider"]) {
      expect(scope, `${name} should be in scope`).toHaveProperty(name);
    }
  });

  it("empty registry returns only primitives — no extra keys", () => {
    const scope = buildScopeFromRegistry({});
    // should not have non-primitive keys
    expect(scope).not.toHaveProperty("MyButton");
  });
});

describe("buildScopeFromRegistry — includes registry entries with component set (AC-2, AC-3)", () => {
  it("includes a component whose entry has component set, keyed by name", () => {
    const MyBtn = () => <button />;
    const registry: ComponentRegistry = {
      MyBtn: { name: "MyBtn", allowedProps: [], component: MyBtn },
    };
    const scope = buildScopeFromRegistry(registry);
    expect(scope["MyBtn"]).toBe(MyBtn);
  });

  it("ignores registry entries where component is undefined", () => {
    const registry: ComponentRegistry = {
      Ghost: { name: "Ghost", allowedProps: [] },
    };
    const scope = buildScopeFromRegistry(registry);
    expect(scope).not.toHaveProperty("Ghost");
  });

  it("ignores registry entries where component is null", () => {
    const registry: ComponentRegistry = {
      Ghost: { name: "Ghost", allowedProps: [], component: null },
    };
    const scope = buildScopeFromRegistry(registry);
    expect(scope).not.toHaveProperty("Ghost");
  });

  it("skips entries with empty-string name", () => {
    const registry: ComponentRegistry = {
      "": { name: "", allowedProps: [], component: () => null },
    };
    const scope = buildScopeFromRegistry(registry);
    expect(Object.keys(scope).every((k) => k !== "")).toBe(true);
  });

  it("last entry wins when two entries share the same name (AC-2)", () => {
    const First = () => <span>first</span>;
    const Second = () => <span>second</span>;
    const registry: ComponentRegistry = {
      Dup: { name: "Dup", allowedProps: [], component: First },
      Dup2: { name: "Dup", allowedProps: [], component: Second },
    };
    const scope = buildScopeFromRegistry(registry);
    // Second entry overwrites First under key "Dup"
    expect(scope["Dup"]).toBe(Second);
  });

  it("registry entry name matching a primitive shadows the primitive (AC-2)", () => {
    const CustomStack = () => <div />;
    const registry: ComponentRegistry = {
      Stack: { name: "Stack", allowedProps: [], component: CustomStack },
    };
    const scope = buildScopeFromRegistry(registry);
    expect(scope["Stack"]).toBe(CustomStack);
    // Other primitives still present
    expect(scope).toHaveProperty("Page");
  });
});

describe("buildScopeFromRegistry — includes all primitives even with no components (AC-8)", () => {
  it("all-spec-only registry still returns primitives", () => {
    const registry: ComponentRegistry = {
      Badge: { name: "Badge", allowedProps: ["variant"] },
      Button: { name: "Button", allowedProps: ["size"] },
    };
    const scope = buildScopeFromRegistry(registry);
    expect(scope).toHaveProperty("Stack");
    expect(scope).toHaveProperty("Page");
    expect(scope).not.toHaveProperty("Badge");
    expect(scope).not.toHaveProperty("Button");
  });
});

describe("renderJSX — AC-7 renders valid JSX with scoped components", () => {
  it("returns a React element", () => {
    const scope = buildScopeFromRegistry({ Stack: { name: "Stack", allowedProps: [], component: Stack } });
    const element = renderJSX("<Stack />", scope);
    expect(React.isValidElement(element)).toBe(true);
  });

  it("renders without throwing for valid scoped code", () => {
    const scope = buildScopeFromRegistry({});
    expect(() => renderToStaticMarkup(renderJSX("<Stack />", scope))).not.toThrow();
  });
});

describe("renderJSX — AC-8 explicit error for missing component", () => {
  it("returns an error element when component is not in scope", () => {
    const scope = buildScopeFromRegistry({}); // no UnknownWidget
    const element = renderJSX("<UnknownWidget />", scope);
    const html = renderToStaticMarkup(element);
    expect(html).toMatch(/UnknownWidget/);
    expect(html).toMatch(/error|missing|not.*found/i);
  });

  it("does not render undefined silently — element has content", () => {
    const scope = buildScopeFromRegistry({});
    const element = renderJSX("<GhostComponent />", scope);
    const html = renderToStaticMarkup(element);
    expect(html.trim()).not.toBe("");
    expect(html).toMatch(/GhostComponent/);
  });
});
