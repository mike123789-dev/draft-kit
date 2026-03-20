import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { buildScope, renderJSX } from "./jsx-renderer";
import { Stack } from "./primitives";

describe("buildScope — AC-7 layout primitives always in scope", () => {
  it("includes all 8 layout primitives", () => {
    const scope = buildScope();
    for (const name of ["Page", "Section", "Container", "Stack", "Inline", "Grid", "Spacer", "Divider"]) {
      expect(scope, `${name} should be in scope`).toHaveProperty(name);
    }
  });

  it("merges additional components into scope", () => {
    const scope = buildScope({ MyButton: () => <button /> });
    expect(scope).toHaveProperty("MyButton");
    expect(scope).toHaveProperty("Stack"); // primitives still present
  });

  it("scope values are callable (React components)", () => {
    const scope = buildScope();
    expect(typeof scope["Stack"]).toBe("function");
  });
});

describe("renderJSX — AC-7 renders valid JSX with scoped components", () => {
  it("returns a React element", () => {
    const scope = buildScope({ Stack });
    const element = renderJSX("<Stack />", scope);
    expect(React.isValidElement(element)).toBe(true);
  });

  it("renders without throwing for valid scoped code", () => {
    const scope = buildScope();
    expect(() => renderToStaticMarkup(renderJSX("<Stack />", scope))).not.toThrow();
  });
});

describe("renderJSX — AC-8 explicit error for missing component", () => {
  it("returns an error element when component is not in scope", () => {
    const scope = buildScope(); // no UnknownWidget
    const element = renderJSX("<UnknownWidget />", scope);
    const html = renderToStaticMarkup(element);
    expect(html).toMatch(/UnknownWidget/);
    expect(html).toMatch(/error|missing|not.*found/i);
  });

  it("does not render undefined silently — element has content", () => {
    const scope = buildScope();
    const element = renderJSX("<GhostComponent />", scope);
    const html = renderToStaticMarkup(element);
    expect(html.trim()).not.toBe("");
    expect(html).toMatch(/GhostComponent/);
  });
});
