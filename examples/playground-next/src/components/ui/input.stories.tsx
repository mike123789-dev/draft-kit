import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Email address",
    type: "email",
    disabled: false,
  },
  argTypes: {
    placeholder: { control: "text" },
    type: { control: "text" },
    disabled: { control: "boolean" },
  },
  parameters: {
    draftkit: {
      importPath: "@/components/ui/input",
      source: "example",
      group: "ui",
      componentName: "Input",
      description: "Single-line text input.",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div className="grid w-80 gap-3">
      <Input placeholder="Default" />
      <Input placeholder="Invalid" aria-invalid />
      <Input placeholder="Disabled" disabled />
    </div>
  ),
};
