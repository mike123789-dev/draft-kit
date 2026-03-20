import { describe, expect, it } from "vitest";

import { defaultRegistry } from "./layout";
import { validateDraft } from "./validate";

describe("validateDraft", () => {
  it("accepts nodes that match the registry", () => {
    const draft = {
      type: "Page",
      props: { padding: 24 },
      children: [{ type: "Text", props: { size: "md" }, text: "hello" }],
    };

    const result = validateDraft(draft, defaultRegistry);

    expect(result.ok).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("reports unknown components and invalid props", () => {
    const draft = {
      type: "Page",
      props: { bad: true },
      children: [{ type: "UnknownWidget", props: { foo: "bar" } }],
    };

    const result = validateDraft(draft, defaultRegistry);

    expect(result.ok).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some((issue) => issue.message.includes("허용되지 않은 컴포넌트"))).toBe(true);
  });
});
