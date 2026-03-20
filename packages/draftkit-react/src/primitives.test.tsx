import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  Container,
  Divider,
  Grid,
  Inline,
  Page,
  Section,
  Spacer,
  Stack,
} from "./primitives";

function renderStyle(element: React.ReactElement): Record<string, string> {
  const html = renderToStaticMarkup(element);
  const match = html.match(/style="([^"]*)"/);
  if (!match) return {};
  const pairs: Record<string, string> = {};
  for (const part of match[1].split(";")) {
    const [k, v] = part.split(":").map((s) => s.trim());
    if (k && v) pairs[k] = v;
  }
  return pairs;
}

describe("Stack props (AC-2, AC-4)", () => {
  it("renders with default gap of 12px", () => {
    const style = renderStyle(<Stack><span>a</span></Stack>);
    expect(style["gap"]).toBe("12px");
  });

  it("renders with custom gap", () => {
    const style = renderStyle(<Stack gap={24}><span>a</span></Stack>);
    expect(style["gap"]).toBe("24px");
  });

  it("renders with align and justify", () => {
    const style = renderStyle(
      <Stack align="center" justify="space-between"><span>a</span></Stack>,
    );
    expect(style["align-items"]).toBe("center");
    expect(style["justify-content"]).toBe("space-between");
  });
});

describe("Grid props (AC-2, AC-3)", () => {
  it("renders with default columns=1 and gap=12", () => {
    const style = renderStyle(<Grid><span>a</span></Grid>);
    expect(style["grid-template-columns"]).toBe("repeat(1,1fr)");
    expect(style["gap"]).toBe("12px");
  });

  it("renders with custom columns", () => {
    const style = renderStyle(<Grid columns={3}><span>a</span></Grid>);
    expect(style["grid-template-columns"]).toBe("repeat(3,1fr)");
  });

  it("renders with custom gap", () => {
    const style = renderStyle(<Grid gap={8}><span>a</span></Grid>);
    expect(style["gap"]).toBe("8px");
  });
});

describe("Inline props (AC-2, AC-4, AC-5)", () => {
  it("renders with default wrap=true and gap=12", () => {
    const style = renderStyle(<Inline><span>a</span></Inline>);
    expect(style["flex-wrap"]).toBe("wrap");
    expect(style["gap"]).toBe("12px");
  });

  it("renders with wrap=false", () => {
    const style = renderStyle(<Inline wrap={false}><span>a</span></Inline>);
    expect(style["flex-wrap"]).toBe("nowrap");
  });

  it("renders with align", () => {
    const style = renderStyle(<Inline align="start"><span>a</span></Inline>);
    expect(style["align-items"]).toBe("start");
  });
});

describe("Container props (AC-6)", () => {
  it("renders with default maxWidth=960", () => {
    const style = renderStyle(<Container><span>a</span></Container>);
    expect(style["max-width"]).toBe("960px");
  });

  it("renders with custom maxWidth", () => {
    const style = renderStyle(<Container maxWidth={1200}><span>a</span></Container>);
    expect(style["max-width"]).toBe("1200px");
  });
});

describe("Spacer props (AC-10)", () => {
  it("renders with default size=8", () => {
    const style = renderStyle(<Spacer />);
    expect(style["height"]).toBe("8px");
  });

  it("renders with custom size", () => {
    const style = renderStyle(<Spacer size={16} />);
    expect(style["height"]).toBe("16px");
  });
});

describe("Divider props (AC-10)", () => {
  it("renders with custom marginY", () => {
    const style = renderStyle(<Divider marginY={12} />);
    expect(style["margin-top"]).toBe("12px");
    expect(style["margin-bottom"]).toBe("12px");
  });
});

describe("Page props (AC-10)", () => {
  it("renders with custom padding", () => {
    const style = renderStyle(<Page padding={24}><span>a</span></Page>);
    expect(style["padding"]).toBe("24px");
  });

  it("renders with custom background", () => {
    const style = renderStyle(<Page background="#fff"><span>a</span></Page>);
    expect(style["background"]).toBe("#fff");
  });
});

describe("Section props (AC-10)", () => {
  it("renders with paddingY and background", () => {
    const style = renderStyle(
      <Section paddingY={16} background="#f0f0f0"><span>a</span></Section>,
    );
    expect(style["padding-top"]).toBe("16px");
    expect(style["padding-bottom"]).toBe("16px");
    expect(style["background"]).toBe("#f0f0f0");
  });
});
