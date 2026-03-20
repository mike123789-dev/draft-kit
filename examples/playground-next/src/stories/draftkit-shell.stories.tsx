import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { defaultRegistry } from "@draftkit/core";
import { DraftKitShell } from "@draftkit/react";

const meta = {
  title: "DraftKit/Shell",
  component: DraftKitShell,
  tags: ["autodocs"],
  args: {
    registry: defaultRegistry,
  },
  parameters: {
    layout: "fullscreen",
    draftkit: {
      importPath: "@draftkit/react",
      source: "example",
      group: "draftkit",
      componentName: "DraftKitShell",
      description: "Main runtime shell that composes prompt panel and overlay preview.",
    },
  },
} satisfies Meta<typeof DraftKitShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
