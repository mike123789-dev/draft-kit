import { describe, expect, it } from "vitest";

import type { ComponentRegistry } from "./types";
import { parse } from "@babel/parser";

import { checkComponentNames, checkForbiddenPatterns, parseJSX } from "./jsx-validate";
import { defaultRegistry } from "./layout";

const emptyRegistry: ComponentRegistry = {};

describe("parseJSX — pre-checks and syntax validation (T-001, AC-1)", () => {
  it("rejects empty string", () => {
    const result = parseJSX("", emptyRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues[0].message).toMatch(/empty/i);
  });

  it("rejects whitespace-only string", () => {
    const result = parseJSX("   \n  \t  ", emptyRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues[0].message).toMatch(/empty/i);
  });

  it("rejects string exceeding 50KB", () => {
    const big = "<Button />".repeat(6000); // ~60KB
    const result = parseJSX(big, emptyRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues[0].message).toMatch(/size/i);
  });

  it("returns syntax error with line and col for invalid JSX", () => {
    const result = parseJSX("<Button unclosed", emptyRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].line).toBeTypeOf("number");
    expect(result.issues[0].col).toBeTypeOf("number");
  });

  it("accepts valid self-closing JSX", () => {
    const result = parseJSX("<Button />", emptyRegistry);
    // parseJSX only handles pre-checks and syntax; component name validation is separate
    // A valid parse should not fail at the parse stage (even if registry is empty)
    expect(result.ok).toBe(true);
  });

  it("accepts fragment syntax", () => {
    const result = parseJSX("<>hello</>", emptyRegistry);
    expect(result.ok).toBe(true);
  });

  it("accepts nested JSX with expressions", () => {
    const result = parseJSX("<Stack gap={12}><Text>{1 + 1}</Text></Stack>", emptyRegistry);
    expect(result.ok).toBe(true);
  });
});

function ast(code: string) {
  return parse(code, { plugins: ["jsx"], sourceType: "module" });
}

describe("checkForbiddenPatterns — AC-2 import/export", () => {
  it("rejects import statement and includes keyword and line in error", () => {
    const issues = checkForbiddenPatterns(ast("import React from 'react';\n<Button />"));
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toMatch(/import/i);
    expect(issues[0].line).toBeTypeOf("number");
  });

  it("rejects export statement", () => {
    const issues = checkForbiddenPatterns(ast("export default <Button />"));
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toMatch(/export/i);
  });
});

describe("checkForbiddenPatterns — AC-3 forbidden globals", () => {
  it.each(["window", "document", "globalThis", "eval", "Function", "setTimeout", "setInterval"])(
    "rejects reference to %s",
    (global) => {
      const issues = checkForbiddenPatterns(ast(`<Button onClick={() => { const x = ${global}; }} />`));
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].message).toMatch(new RegExp(global));
    }
  );
});

describe("checkForbiddenPatterns — AC-5 React hooks", () => {
  it.each(["useState", "useEffect", "useReducer", "useRef", "useMemo", "useCallback", "useContext"])(
    "rejects named hook %s",
    (hook) => {
      const issues = checkForbiddenPatterns(ast(`<Button onClick={() => ${hook}()} />`));
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].message).toMatch(new RegExp(hook));
    }
  );

  it("rejects custom hook matching use+Uppercase convention", () => {
    const issues = checkForbiddenPatterns(ast("<Button onClick={() => useMyData()} />"));
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toMatch(/useMyData/);
  });
});

describe("checkForbiddenPatterns — AC-6 async patterns", () => {
  it("rejects async function expression", () => {
    const issues = checkForbiddenPatterns(ast("<Button onClick={async () => {}} />"));
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toMatch(/async/i);
  });

  it("rejects fetch identifier", () => {
    const issues = checkForbiddenPatterns(ast("<Button onClick={() => fetch('/api')} />"));
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toMatch(/fetch/i);
  });

  it("rejects XMLHttpRequest identifier", () => {
    const issues = checkForbiddenPatterns(ast("<Button onClick={() => XMLHttpRequest()} />"));
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toMatch(/XMLHttpRequest/i);
  });
});

describe("checkForbiddenPatterns — template literals (edge case)", () => {
  it("catches forbidden globals inside template literals", () => {
    const issues = checkForbiddenPatterns(ast("<Text>{`${window.title}`}</Text>"));
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toMatch(/window/i);
  });
});

describe("checkForbiddenPatterns — allowed patterns", () => {
  it("allows simple arithmetic expression", () => {
    const issues = checkForbiddenPatterns(ast("<Text>{1 + 1}</Text>"));
    expect(issues).toHaveLength(0);
  });

  it("allows string literals", () => {
    const issues = checkForbiddenPatterns(ast('<Text>{"hello"}</Text>'));
    expect(issues).toHaveLength(0);
  });

  it("allows inline style objects", () => {
    const issues = checkForbiddenPatterns(ast("<Button style={{ color: 'red' }} />"));
    expect(issues).toHaveLength(0);
  });
});

describe("checkComponentNames — AC-4 registry-scoped validation", () => {
  const registry = defaultRegistry;

  it("accepts component in registry", () => {
    const issues = checkComponentNames(ast("<Text />"), registry);
    expect(issues).toHaveLength(0);
  });

  it("rejects unknown component not in registry or layout primitives", () => {
    const issues = checkComponentNames(ast("<UnknownWidget />"), registry);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toMatch(/UnknownWidget/);
  });

  it("accepts layout primitives without explicit registry entry", () => {
    for (const name of ["Page", "Section", "Container", "Stack", "Inline", "Grid", "Spacer", "Divider"]) {
      const issues = checkComponentNames(ast(`<${name} />`), registry);
      expect(issues, `${name} should be accepted`).toHaveLength(0);
    }
  });

  it("rejects lowercase HTML element names", () => {
    const issues = checkComponentNames(ast("<div />"), registry);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].message).toMatch(/div/);
  });

  it("accepts fragment syntax without error", () => {
    const issues = checkComponentNames(ast("<>hello</>"), registry);
    expect(issues).toHaveLength(0);
  });

  it("accepts nested JSX using only registry/primitive components", () => {
    const issues = checkComponentNames(ast("<Stack><Text>hi</Text></Stack>"), registry);
    expect(issues).toHaveLength(0);
  });

  it("error message includes the unrecognized component name", () => {
    const issues = checkComponentNames(ast("<MyFantasyComponent />"), registry);
    expect(issues[0].message).toMatch(/MyFantasyComponent/);
  });
});
