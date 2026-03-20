import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Plus } from "lucide-react";

import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
    variant: "default",
    size: "default",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
    disabled: { control: "boolean" },
    children: { control: "text" },
    onClick: { action: "clicked" },
  },
  parameters: {
    draftkit: {
      importPath: "@/components/ui/button",
      source: "example",
      group: "ui",
      componentName: "Button",
      description: "Primary action button with variant and size tokens.",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus />
        Add item
      </>
    ),
  },
};
