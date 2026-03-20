import { describe, expect, it } from "vitest";

import { generateDraftResponse } from "./index";

describe("generateDraftResponse", () => {
  it("returns JSX and validation state", () => {
    const result = generateDraftResponse("landing page form");

    expect(result.validationOk).toBe(true);
    expect(result.firstIssue).toBeUndefined();
    expect(result.jsx).toContain("export default function DraftOutput");
    expect(result.jsx).toContain("<Page");
  });
});
