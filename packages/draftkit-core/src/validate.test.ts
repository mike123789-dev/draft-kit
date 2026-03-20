import { describe, expect, it } from "vitest";

import { defaultRegistry } from "./layout";
import type { DraftNode } from "./types";
import { validateDraft } from "./validate";

describe("validateDraft", () => {
  it("accepts nodes that match the registry", () => {
    const draft: DraftNode = {
      type: "Page",
      props: { padding: 24 },
      children: [{ type: "Text", props: { size: "md" }, text: "hello" }],
    };

    const result = validateDraft(draft, defaultRegistry);

    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("reports unknown components and invalid props", () => {
    const draft: DraftNode = {
      type: "Page",
      props: { bad: true },
      children: [{ type: "UnknownWidget", props: { foo: "bar" } }],
    };

    const result = validateDraft(draft, defaultRegistry);

    expect(result.ok).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some((issue) => issue.message.includes("unknown component"))).toBe(true);
  });
});

describe("structural validation — nesting depth (T-002, AC-7)", () => {
  // nestLayout(n) creates n layout levels UNDER Page, so total = n + 1 (Page counts as 1)
  function nestLayout(levelsUnderPage: number): DraftNode {
    let node: DraftNode = { type: "Text", text: "leaf" };
    const primitives = ["Stack", "Section", "Container", "Stack", "Inline"];
    for (let i = levelsUnderPage - 1; i >= 0; i--) {
      node = { type: primitives[i % primitives.length], children: [node] };
    }
    return { type: "Page", children: [node] };
  }

  it("accepts layout nesting at exactly depth 4", () => {
    // Page(1) > Stack(2) > Section(3) > Container(4) > Text = 4 layout levels total
    const draft = nestLayout(3);
    const result = validateDraft(draft, defaultRegistry);
    expect(result.ok).toBe(true);
  });

  it("rejects layout nesting at depth 5 with node path in error", () => {
    // Page(1) > Stack(2) > Section(3) > Container(4) > Stack(5) > Text = 5 layout levels
    const draft = nestLayout(4);
    const result = validateDraft(draft, defaultRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes("nesting depth"))).toBe(true);
    expect(result.issues.some((i) => i.path.length > 0)).toBe(true);
  });

  it("UI components do not count toward layout nesting depth", () => {
    // Page(1) > Stack(2) > Card(not counted) > Stack(3) > Container(4) > Text
    // Layout depth = 4, should pass
    const draft: DraftNode = {
      type: "Page",
      children: [
        {
          type: "Stack",
          children: [
            {
              type: "Card",
              children: [
                {
                  type: "Stack",
                  children: [
                    {
                      type: "Container",
                      children: [{ type: "Text", text: "deep" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const result = validateDraft(draft, defaultRegistry);
    expect(result.ok).toBe(true);
  });

  it("UI components don't shield layout depth — still fails at 5", () => {
    // Page(1) > Stack(2) > Card(not counted) > Stack(3) > Container(4) > Stack(5) > Text
    // Layout depth = 5, should fail
    const draft: DraftNode = {
      type: "Page",
      children: [
        {
          type: "Stack",
          children: [
            {
              type: "Card",
              children: [
                {
                  type: "Stack",
                  children: [
                    {
                      type: "Container",
                      children: [
                        {
                          type: "Stack",
                          children: [{ type: "Text", text: "deep" }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const result = validateDraft(draft, defaultRegistry);
    expect(result.ok).toBe(false);
  });
});

describe("structural validation — raw HTML rejection (T-002, AC-8)", () => {
  it("rejects div at any level", () => {
    const draft: DraftNode = {
      type: "Page",
      children: [{ type: "div", children: [{ type: "Text", text: "hi" }] }],
    };
    const result = validateDraft(draft, defaultRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes("raw HTML") || i.message.includes("div"))).toBe(true);
  });

  it("rejects span, p, h1, ul, li, table, img, a, form, input, button, textarea, select, label", () => {
    const elements = ["span", "p", "h1", "ul", "li", "table", "img", "a", "form", "input", "button", "textarea", "select", "label"];
    for (const el of elements) {
      const draft: DraftNode = {
        type: "Page",
        children: [{ type: el }],
      };
      const result = validateDraft(draft, defaultRegistry);
      expect(result.ok, `${el} should be rejected`).toBe(false);
    }
  });

  it("rejects section, article, header, footer, main, nav, aside", () => {
    const elements = ["section", "article", "header", "footer", "main", "nav", "aside"];
    for (const el of elements) {
      const draft: DraftNode = {
        type: "Page",
        children: [{ type: el }],
      };
      const result = validateDraft(draft, defaultRegistry);
      expect(result.ok, `${el} should be rejected`).toBe(false);
    }
  });
});

describe("structural validation — children constraints (T-002)", () => {
  it("rejects Spacer with children", () => {
    const draft: DraftNode = {
      type: "Page",
      children: [{ type: "Spacer", children: [{ type: "Text", text: "bad" }] }],
    };
    const result = validateDraft(draft, defaultRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes("children"))).toBe(true);
  });

  it("rejects Divider with children", () => {
    const draft: DraftNode = {
      type: "Page",
      children: [{ type: "Divider", children: [{ type: "Text", text: "bad" }] }],
    };
    const result = validateDraft(draft, defaultRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes("children"))).toBe(true);
  });
});

describe("structural validation — enum/range prop values (T-002)", () => {
  it("rejects invalid enum value for align", () => {
    const draft: DraftNode = {
      type: "Page",
      children: [{ type: "Stack", props: { align: "bogus" } }],
    };
    const result = validateDraft(draft, defaultRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes("bogus"))).toBe(true);
  });

  it("rejects Grid with columns <= 0", () => {
    const draft: DraftNode = {
      type: "Page",
      children: [{ type: "Grid", props: { columns: 0 } }],
    };
    const result = validateDraft(draft, defaultRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes("columns"))).toBe(true);
  });

  it("rejects negative gap", () => {
    const draft: DraftNode = {
      type: "Page",
      children: [{ type: "Stack", props: { gap: -5 } }],
    };
    const result = validateDraft(draft, defaultRegistry);
    expect(result.ok).toBe(false);
    expect(result.issues.some((i) => i.message.includes("gap"))).toBe(true);
  });

  it("accepts valid enum values", () => {
    const draft: DraftNode = {
      type: "Page",
      children: [{ type: "Stack", props: { align: "center", justify: "space-between" } }],
    };
    const result = validateDraft(draft, defaultRegistry);
    expect(result.ok).toBe(true);
  });
});
