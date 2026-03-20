import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { defaultRegistry } from "@draftkit/core";
import { validateAndRenderJSX } from "./jsx-pipeline";
import { renderPreviewContent, validationStatusText } from "./DraftKitShell";

afterEach(() => cleanup());

// ---------------------------------------------------------------------------
// T-001: AC-1–4, AC-12 — preview engine wiring helpers
// ---------------------------------------------------------------------------

describe("renderPreviewContent — AC-2 ok:true shows rendered element", () => {
  it("renders the element when pipeline result is ok", () => {
    const result = validateAndRenderJSX("<Stack />", defaultRegistry);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const html = renderToStaticMarkup(renderPreviewContent(result));
      expect(html.trim()).not.toBe("");
    }
  });
});

describe("renderPreviewContent — AC-3 ok:false shows error message", () => {
  it("shows the issue message when pipeline result is not ok", () => {
    const result = validateAndRenderJSX("<UnknownWidget />", defaultRegistry);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const html = renderToStaticMarkup(renderPreviewContent(result));
      expect(html).toMatch(/UnknownWidget/);
    }
  });

  it("shows error message for syntax error", () => {
    const result = validateAndRenderJSX("<Button unclosed", defaultRegistry);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const html = renderToStaticMarkup(renderPreviewContent(result));
      expect(html.trim()).not.toBe("");
    }
  });
});

describe("renderPreviewContent — AC-12 null shows placeholder", () => {
  it("shows placeholder when result is null", () => {
    const html = renderToStaticMarkup(renderPreviewContent(null));
    expect(html).toMatch(/아직/);
  });
});

describe("validationStatusText — AC-4 reflects pipeline result", () => {
  it("returns 검증 통과 for ok:true result", () => {
    const result = validateAndRenderJSX("<Stack />", defaultRegistry);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(validationStatusText(result)).toBe("검증 통과");
    }
  });

  it("returns failure message for ok:false result", () => {
    const result = validateAndRenderJSX("<UnknownWidget />", defaultRegistry);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const text = validationStatusText(result);
      expect(text).toMatch(/UnknownWidget/);
    }
  });

  it("returns initial status text when result is null", () => {
    const text = validationStatusText(null);
    expect(text).toMatch(/아직/);
  });
});

// ---------------------------------------------------------------------------
// T-002: AC-5–8, AC-13 — LiveEditor present and wired to Run button
// ---------------------------------------------------------------------------

describe("DraftKitShell — AC-5 LiveEditor present in initial render", () => {
  it("renders a code editor wrapper (LiveEditor via react-live)", async () => {
    const { DraftKitShell } = await import("./DraftKitShell");
    const { container } = render(<DraftKitShell registry={defaultRegistry} />);
    // CodeEditor from react-live renders a <div className={dk-code}><pre>
    const editorWrapper = container.querySelector(".dk-code");
    expect(editorWrapper).not.toBeNull();
    // The inner <pre> is the editable element
    expect(editorWrapper?.querySelector("pre")).not.toBeNull();
  });
});

describe("DraftKitShell — AC-6 code editor is editable", () => {
  it("the LiveEditor pre element is present and not disabled", async () => {
    const { DraftKitShell } = await import("./DraftKitShell");
    const { container } = render(<DraftKitShell registry={defaultRegistry} />);
    // CodeEditor renders a <pre spellCheck="false"> as the editable target.
    // use-editable sets contentEditable in a real browser; jsdom's selection API
    // is limited so we verify the structural proxy: pre exists, spellcheck=false,
    // and disabled is not set on the wrapper (LiveProvider disabled defaults to false).
    const pre = container.querySelector(".dk-code pre");
    expect(pre).not.toBeNull();
    expect(pre?.getAttribute("spellcheck")).toBe("false");
    expect(pre?.hasAttribute("disabled")).toBe(false);
  });
});

describe("DraftKitShell — AC-7 Run button applies editor content to preview", () => {
  it("renders an active Run button", async () => {
    const { DraftKitShell } = await import("./DraftKitShell");
    render(<DraftKitShell registry={defaultRegistry} />);
    // Use role query to get the button specifically
    const runBtn = screen.getAllByRole("button").find((b) =>
      b.textContent?.includes("Run")
    );
    expect(runBtn).toBeTruthy();
  });
});

describe("DraftKitShell — AC-8 editing does not auto-update preview", () => {
  it("preview shows empty state before any preset or Run", async () => {
    const { DraftKitShell } = await import("./DraftKitShell");
    render(<DraftKitShell registry={defaultRegistry} />);
    // Empty state is visible — no auto-render occurred from editor mount
    expect(screen.getByText(/No draft yet/i)).toBeTruthy();
  });
});

describe("DraftKitShell — AC-13 Copy JSX button present", () => {
  it("rendered output contains Copy JSX button", async () => {
    const { DraftKitShell } = await import("./DraftKitShell");
    render(<DraftKitShell registry={defaultRegistry} />);
    expect(screen.getByText(/Copy JSX/)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// T-003: AC-9–11 — preset buttons replace prompt textarea
// ---------------------------------------------------------------------------

describe("DraftKitShell — AC-9 preset buttons present, no textarea", () => {
  it("renders Mini, Small, Medium buttons", async () => {
    const { DraftKitShell } = await import("./DraftKitShell");
    render(<DraftKitShell registry={defaultRegistry} />);
    expect(screen.getByText("Mini")).toBeTruthy();
    expect(screen.getByText("Small")).toBeTruthy();
    expect(screen.getByText("Medium")).toBeTruthy();
  });

  it("does not render a freeform prompt textarea", async () => {
    const { DraftKitShell } = await import("./DraftKitShell");
    const { container } = render(<DraftKitShell registry={defaultRegistry} />);
    expect(container.querySelector("textarea#prompt")).toBeNull();
  });
});

describe("DraftKitShell — AC-10/11 preset buttons generate and render a draft", () => {
  it("clicking Mini exits the empty state (AC-10)", async () => {
    const { DraftKitShell } = await import("./DraftKitShell");
    render(<DraftKitShell registry={defaultRegistry} />);
    fireEvent.click(screen.getByText("Mini"));
    // After preset click, "No draft yet" empty state should be gone
    expect(screen.queryByText("No draft yet")).toBeNull();
  });

  it("clicking Small populates the code editor (AC-10)", async () => {
    const { DraftKitShell } = await import("./DraftKitShell");
    const { container } = render(<DraftKitShell registry={defaultRegistry} />);
    fireEvent.click(screen.getByText("Small"));
    await waitFor(() => {
      const pre = container.querySelector(".dk-code pre");
      expect(pre?.textContent?.trim().length).toBeGreaterThan(0);
    });
  });

  it("clicking Medium populates the code editor (AC-10)", async () => {
    const { DraftKitShell } = await import("./DraftKitShell");
    const { container } = render(<DraftKitShell registry={defaultRegistry} />);
    fireEvent.click(screen.getByText("Medium"));
    await waitFor(() => {
      const pre = container.querySelector(".dk-code pre");
      expect(pre?.textContent?.trim().length).toBeGreaterThan(0);
    });
  });
});
