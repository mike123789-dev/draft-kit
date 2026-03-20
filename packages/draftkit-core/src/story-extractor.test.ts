import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { extractRegistryFromStories, extractSpecFromStory } from "./story-extractor";
// AC-9: verify both functions are re-exported from the barrel index
import * as CoreIndex from "./index";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const BADGE_STORY = `
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "New",
    variant: "default",
  },
  argTypes: {
    children: { control: "text" },
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
  parameters: {
    draftkit: {
      importPath: "@/components/ui/badge",
      source: "example",
      group: "ui",
      componentName: "Badge",
      description: "Compact label component.",
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
`;

const STORY_NO_DRAFTKIT = `
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  argTypes: {
    label: { control: "text" },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Button>;

export default meta;
`;

const STORY_WITH_ACTION_PROP = `
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  argTypes: {
    variant: { control: "select", options: ["default", "outline"] },
    onClick: { action: "clicked" },
    children: { control: "text" },
  },
  args: {
    variant: "default",
  },
  parameters: {
    draftkit: {
      importPath: "@/components/ui/button",
      componentName: "Button",
      description: "A button.",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
`;

const STORY_BOOLEAN_AND_TEXT = `
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  args: {
    placeholder: "Email",
    disabled: false,
  },
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
  parameters: {
    draftkit: {
      importPath: "@/components/ui/input",
      componentName: "Input",
      description: "Single-line text input.",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
`;

const STORY_OBJECT_CONTROL = `
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "./textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  args: {
    placeholder: "Write...",
    rows: 4,
    disabled: false,
  },
  argTypes: {
    placeholder: { control: "text" },
    rows: { control: { type: "number", min: 2, max: 12, step: 1 } },
    disabled: { control: "boolean" },
  },
  parameters: {
    draftkit: {
      importPath: "@/components/ui/textarea",
      componentName: "Textarea",
      description: "Multi-line text input.",
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
`;

const STORY_NO_ARGS = `
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card } from "./card";

const meta = {
  title: "UI/Card",
  component: Card,
  argTypes: {
    size: { control: "select", options: ["default", "sm"] },
  },
  parameters: {
    draftkit: {
      importPath: "@/components/ui/card",
      componentName: "Card",
      description: "Container card.",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
`;

const STORY_NO_ARGTYPES = `
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Separator } from "./separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  parameters: {
    draftkit: {
      importPath: "@/components/ui/separator",
      componentName: "Separator",
      description: "Horizontal divider.",
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
`;

const STORY_MISSING_COMPONENT_NAME = `
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Foo } from "./foo";

const meta = {
  title: "UI/Foo",
  component: Foo,
  parameters: {
    draftkit: {
      importPath: "@/components/ui/foo",
      description: "Foo.",
    },
  },
} satisfies Meta<typeof Foo>;

export default meta;
`;

const MALFORMED_CONTENT = `this is not valid typescript {{{`;

// ---------------------------------------------------------------------------
// AC-1: returns null when parameters.draftkit is absent
// ---------------------------------------------------------------------------

describe("extractSpecFromStory — AC-1: null when no draftkit param", () => {
  it("returns null for story without parameters.draftkit", () => {
    expect(extractSpecFromStory(STORY_NO_DRAFTKIT)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractSpecFromStory("")).toBeNull();
  });

  it("returns null for malformed/unparseable content", () => {
    expect(extractSpecFromStory(MALFORMED_CONTENT)).toBeNull();
  });

  it("returns null when componentName is absent from draftkit params", () => {
    expect(extractSpecFromStory(STORY_MISSING_COMPONENT_NAME)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// AC-2: extracts name from parameters.draftkit.componentName
// ---------------------------------------------------------------------------

describe("extractSpecFromStory — AC-2: name from componentName", () => {
  it("sets name to componentName value", () => {
    const spec = extractSpecFromStory(BADGE_STORY);
    expect(spec).not.toBeNull();
    expect(spec!.name).toBe("Badge");
  });

  it("sets name to Textarea", () => {
    const spec = extractSpecFromStory(STORY_OBJECT_CONTROL);
    expect(spec!.name).toBe("Textarea");
  });
});

// ---------------------------------------------------------------------------
// AC-3: allowedProps from argTypes keys, excluding action-type props
// ---------------------------------------------------------------------------

describe("extractSpecFromStory — AC-3: allowedProps from argTypes", () => {
  it("includes all non-action argType keys", () => {
    const spec = extractSpecFromStory(BADGE_STORY);
    expect(spec!.allowedProps).toContain("children");
    expect(spec!.allowedProps).toContain("variant");
  });

  it("excludes action-type props (those with action property)", () => {
    const spec = extractSpecFromStory(STORY_WITH_ACTION_PROP);
    expect(spec!.allowedProps).toContain("variant");
    expect(spec!.allowedProps).toContain("children");
    expect(spec!.allowedProps).not.toContain("onClick");
  });

  it("returns empty allowedProps when argTypes is absent", () => {
    const spec = extractSpecFromStory(STORY_NO_ARGTYPES);
    expect(spec!.allowedProps).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// AC-4: propDefs from argTypes + defaults from args
// ---------------------------------------------------------------------------

describe("extractSpecFromStory — AC-4: propDefs mapping", () => {
  it("maps select control to enum propDef with values and default", () => {
    const spec = extractSpecFromStory(BADGE_STORY);
    expect(spec!.propDefs?.variant).toEqual({
      type: "enum",
      values: ["default", "secondary", "destructive", "outline"],
      default: "default",
    });
  });

  it("maps text control to string propDef with default", () => {
    const spec = extractSpecFromStory(STORY_BOOLEAN_AND_TEXT);
    expect(spec!.propDefs?.placeholder).toEqual({
      type: "string",
      default: "Email",
    });
  });

  it("maps boolean control to boolean propDef with default", () => {
    const spec = extractSpecFromStory(STORY_BOOLEAN_AND_TEXT);
    expect(spec!.propDefs?.disabled).toEqual({
      type: "boolean",
      default: false,
    });
  });

  it("maps object control {type:'number'} to number propDef", () => {
    const spec = extractSpecFromStory(STORY_OBJECT_CONTROL);
    expect(spec!.propDefs?.rows).toMatchObject({ type: "number", default: 4 });
  });

  it("omits default when prop is not in args", () => {
    const spec = extractSpecFromStory(STORY_NO_ARGS);
    // size is in argTypes but not in args
    expect(spec!.propDefs?.size).toBeDefined();
    expect("default" in (spec!.propDefs?.size ?? {})).toBe(false);
  });

  it("returns empty propDefs when argTypes is absent", () => {
    const spec = extractSpecFromStory(STORY_NO_ARGTYPES);
    expect(spec!.propDefs ?? {}).toEqual({});
  });

  it("skips propDef for unknown control type but keeps key in allowedProps", () => {
    const storyWithUnknownControl = BADGE_STORY.replace(
      '{ control: "text" }',
      '{ control: "color" }'
    );
    const spec = extractSpecFromStory(storyWithUnknownControl);
    expect(spec!.allowedProps).toContain("children");
    expect(spec!.propDefs?.children).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// AC-5: description and importPath from parameters.draftkit
// ---------------------------------------------------------------------------

describe("extractSpecFromStory — AC-5: description and importPath", () => {
  it("extracts importPath", () => {
    const spec = extractSpecFromStory(BADGE_STORY);
    expect(spec!.importPath).toBe("@/components/ui/badge");
  });

  it("extracts description", () => {
    const spec = extractSpecFromStory(BADGE_STORY);
    expect(spec!.description).toBe("Compact label component.");
  });

  it("importPath is undefined when absent from draftkit params", () => {
    const storyNoImport = BADGE_STORY.replace('importPath: "@/components/ui/badge",', "");
    const spec = extractSpecFromStory(storyNoImport);
    expect(spec!.importPath).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// AC-6: component field is entirely absent (not undefined)
// ---------------------------------------------------------------------------

describe("extractSpecFromStory — AC-6: component field absent", () => {
  it("does not set component field on returned spec", () => {
    const spec = extractSpecFromStory(BADGE_STORY);
    expect(spec).not.toBeNull();
    expect("component" in spec!).toBe(false);
  });

  it("component field absent even when story meta has component reference", () => {
    const spec = extractSpecFromStory(STORY_BOOLEAN_AND_TEXT);
    expect("component" in spec!).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AC-7: extractRegistryFromStories assembles a ComponentRegistry from files
// ---------------------------------------------------------------------------

describe("extractRegistryFromStories — AC-7: registry assembly", () => {
  it("returns empty registry for empty file list", async () => {
    const registry = await extractRegistryFromStories([]);
    expect(registry).toEqual({});
  });

  it("assembles registry keyed by component name", async () => {
    const tmp = tmpdir();
    const badgePath = join(tmp, "badge.stories.ts");
    const inputPath = join(tmp, "input.stories.ts");
    await writeFile(badgePath, BADGE_STORY);
    await writeFile(inputPath, STORY_BOOLEAN_AND_TEXT);

    const registry = await extractRegistryFromStories([badgePath, inputPath]);
    expect(Object.keys(registry)).toContain("Badge");
    expect(Object.keys(registry)).toContain("Input");
    expect(registry["Badge"].name).toBe("Badge");
    expect(registry["Input"].allowedProps).toContain("placeholder");
  });

  it("skips files without parameters.draftkit", async () => {
    const tmp = tmpdir();
    const noDraftkitPath = join(tmp, "no-draftkit.stories.ts");
    await writeFile(noDraftkitPath, STORY_NO_DRAFTKIT);

    const registry = await extractRegistryFromStories([noDraftkitPath]);
    expect(Object.keys(registry)).toHaveLength(0);
  });

  it("skips non-existent file paths silently", async () => {
    const registry = await extractRegistryFromStories(["/nonexistent/path/foo.stories.ts"]);
    expect(registry).toEqual({});
  });

  it("last-write-wins when two files have entries with the same name", async () => {
    const tmp = tmpdir();
    const first = join(tmp, "first.stories.ts");
    const second = join(tmp, "second.stories.ts");
    const firstStory = BADGE_STORY.replace('"Compact label component."', '"First Badge"');
    const secondStory = BADGE_STORY.replace('"Compact label component."', '"Second Badge"');
    await writeFile(first, firstStory);
    await writeFile(second, secondStory);

    const registry = await extractRegistryFromStories([first, second]);
    expect(registry["Badge"].description).toBe("Second Badge");
  });
});

// ---------------------------------------------------------------------------
// AC-9: both functions exported from barrel index (src/index.ts)
// ---------------------------------------------------------------------------

describe("exports — AC-9: extractSpecFromStory and extractRegistryFromStories in @draftkit/core barrel", () => {
  it("extractSpecFromStory is exported from index", () => {
    expect(typeof CoreIndex.extractSpecFromStory).toBe("function");
  });

  it("extractRegistryFromStories is exported from index", () => {
    expect(typeof CoreIndex.extractRegistryFromStories).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// AC-8: Integration test against the five real playground story files
// ---------------------------------------------------------------------------

// __dirname equivalent for ESM: packages/draftkit-core/src/
const STORY_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../examples/playground-next/src/components/ui"
);

const REAL_STORY_PATHS = [
  join(STORY_DIR, "badge.stories.tsx"),
  join(STORY_DIR, "button.stories.tsx"),
  join(STORY_DIR, "card.stories.tsx"),
  join(STORY_DIR, "input.stories.tsx"),
  join(STORY_DIR, "textarea.stories.tsx"),
];

describe("extractRegistryFromStories — AC-8: real playground story files", () => {
  it("returns entries for all five components", async () => {
    const registry = await extractRegistryFromStories(REAL_STORY_PATHS);
    for (const name of ["Badge", "Button", "Card", "Input", "Textarea"]) {
      expect(registry, `missing entry: ${name}`).toHaveProperty(name);
    }
  });

  it("Badge has allowedProps including variant", async () => {
    const registry = await extractRegistryFromStories(REAL_STORY_PATHS);
    expect(registry["Badge"].allowedProps).toContain("variant");
  });

  it("Button has allowedProps including variant and size", async () => {
    const registry = await extractRegistryFromStories(REAL_STORY_PATHS);
    expect(registry["Button"].allowedProps).toContain("variant");
    expect(registry["Button"].allowedProps).toContain("size");
  });

  it("Button does not include onClick (action prop)", async () => {
    const registry = await extractRegistryFromStories(REAL_STORY_PATHS);
    expect(registry["Button"].allowedProps).not.toContain("onClick");
  });

  it("Badge importPath matches story declaration", async () => {
    const registry = await extractRegistryFromStories(REAL_STORY_PATHS);
    expect(registry["Badge"].importPath).toBe("@/components/ui/badge");
  });

  it("Button importPath matches story declaration", async () => {
    const registry = await extractRegistryFromStories(REAL_STORY_PATHS);
    expect(registry["Button"].importPath).toBe("@/components/ui/button");
  });

  it("Input importPath matches story declaration", async () => {
    const registry = await extractRegistryFromStories(REAL_STORY_PATHS);
    expect(registry["Input"].importPath).toBe("@/components/ui/input");
  });

  it("Textarea importPath matches story declaration", async () => {
    const registry = await extractRegistryFromStories(REAL_STORY_PATHS);
    expect(registry["Textarea"].importPath).toBe("@/components/ui/textarea");
  });

  it("no entry has a component field set", async () => {
    const registry = await extractRegistryFromStories(REAL_STORY_PATHS);
    for (const [name, spec] of Object.entries(registry)) {
      expect("component" in spec, `${name} should not have component field`).toBe(false);
    }
  });
});
