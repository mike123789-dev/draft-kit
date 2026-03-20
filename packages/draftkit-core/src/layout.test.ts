import { describe, expect, it } from "vitest";

import { defaultRegistry, LAYOUT_PRIMITIVES } from "./layout";
import type { ComponentSpec } from "./types";

describe("Enriched ComponentSpec schema (T-001)", () => {
  const layoutNames = [...LAYOUT_PRIMITIVES];

  it("all 8 layout primitives exist in defaultRegistry", () => {
    expect(layoutNames).toHaveLength(8);
    for (const name of layoutNames) {
      expect(defaultRegistry[name]).toBeDefined();
    }
  });

  it("each primitive spec has propDefs with type and default for every prop", () => {
    for (const name of layoutNames) {
      const spec = defaultRegistry[name] as ComponentSpec;
      expect(spec.propDefs).toBeDefined();
      expect(Object.keys(spec.propDefs!).length).toBeGreaterThan(0);

      for (const [propName, def] of Object.entries(spec.propDefs!)) {
        expect(def.type, `${name}.${propName} missing type`).toBeDefined();
        expect(def).toHaveProperty("default");
      }
    }
  });

  it("enum props have a values array", () => {
    for (const name of layoutNames) {
      const spec = defaultRegistry[name] as ComponentSpec;
      for (const [propName, def] of Object.entries(spec.propDefs!)) {
        if (def.type === "enum") {
          expect(
            Array.isArray(def.values) && def.values.length > 0,
            `${name}.${propName} is enum but has no values`,
          ).toBe(true);
        }
      }
    }
  });

  it("each primitive has children constraints defined", () => {
    for (const name of layoutNames) {
      const spec = defaultRegistry[name] as ComponentSpec;
      expect(
        spec.children,
        `${name} missing children constraints`,
      ).toBeDefined();
      expect(typeof spec.children!.allowed).toBe("boolean");
    }
  });

  it("Spacer and Divider disallow children", () => {
    const spacer = defaultRegistry["Spacer"] as ComponentSpec;
    const divider = defaultRegistry["Divider"] as ComponentSpec;
    expect(spacer.children!.allowed).toBe(false);
    expect(divider.children!.allowed).toBe(false);
  });

  it("Stack has gap prop with type number and default 12", () => {
    const spec = defaultRegistry["Stack"] as ComponentSpec;
    expect(spec.propDefs!.gap).toEqual({
      type: "number",
      default: 12,
    });
  });

  it("Grid has columns prop with type number and default 1", () => {
    const spec = defaultRegistry["Grid"] as ComponentSpec;
    expect(spec.propDefs!.columns).toEqual({
      type: "number",
      default: 1,
    });
  });

  it("Container has maxWidth prop with default 960", () => {
    const spec = defaultRegistry["Container"] as ComponentSpec;
    expect(spec.propDefs!.maxWidth.default).toBe(960);
  });

  it("Spacer has size prop with default 8", () => {
    const spec = defaultRegistry["Spacer"] as ComponentSpec;
    expect(spec.propDefs!.size.default).toBe(8);
  });

  it("Inline has wrap prop with type boolean and default true", () => {
    const spec = defaultRegistry["Inline"] as ComponentSpec;
    expect(spec.propDefs!.wrap).toEqual({
      type: "boolean",
      default: true,
    });
  });

  it("align props use enum type with defined values", () => {
    const stack = defaultRegistry["Stack"] as ComponentSpec;
    const inline = defaultRegistry["Inline"] as ComponentSpec;
    expect(stack.propDefs!.align.type).toBe("enum");
    expect(inline.propDefs!.align.type).toBe("enum");
  });
});
