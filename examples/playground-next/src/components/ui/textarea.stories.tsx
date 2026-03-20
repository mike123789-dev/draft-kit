import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Textarea } from "./textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    placeholder: "Write your message...",
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
      source: "example",
      group: "ui",
      componentName: "Textarea",
      description: "Multi-line text input.",
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
