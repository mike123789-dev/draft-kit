import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { defaultRegistry } from "@draftkit/core";
import { validateAndRenderJSX } from "./jsx-pipeline";

describe("validateAndRenderJSX — AC-9 pipeline function", () => {
  it("returns a renderable element for valid JSX with registry components", () => {
    const result = validateAndRenderJSX("<Stack />", defaultRegistry);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(React.isValidElement(result.element)).toBe(true);
      expect(() => renderToStaticMarkup(result.element)).not.toThrow();
    }
  });

  it("returns structured error for invalid JSX (syntax error)", () => {
    const result = validateAndRenderJSX("<Button unclosed", defaultRegistry);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Array.isArray(result.issues)).toBe(true);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].message).toBeTruthy();
    }
  });

  it("returns structured error for forbidden pattern (import)", () => {
    const result = validateAndRenderJSX("import x from 'y'; <Stack />", defaultRegistry);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0].message).toMatch(/import/i);
    }
  });

  it("returns structured error for unknown component", () => {
    const result = validateAndRenderJSX("<UnknownWidget />", defaultRegistry);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0].message).toMatch(/UnknownWidget/);
    }
  });

  it("never throws for validation failures", () => {
    expect(() => validateAndRenderJSX("", defaultRegistry)).not.toThrow();
    expect(() => validateAndRenderJSX("<Button unclosed", defaultRegistry)).not.toThrow();
    expect(() => validateAndRenderJSX("<UnknownWidget />", defaultRegistry)).not.toThrow();
  });

  it("issues array contains message and optional location", () => {
    const result = validateAndRenderJSX("<Button unclosed", defaultRegistry);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]).toHaveProperty("message");
    }
  });
});
