import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  args: {
    size: "default",
  },
  argTypes: {
    size: { control: "select", options: ["default", "sm"] },
  },
  parameters: {
    draftkit: {
      importPath: "@/components/ui/card",
      source: "example",
      group: "ui",
      componentName: "Card",
      description: "Container with semantic header/content/footer slots.",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>DraftKit registry</CardTitle>
        <CardDescription>
          This card story is used as a stable contract for registry extraction.
        </CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Action
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        Keep title, description, and size args explicit for reliable metadata.
      </CardContent>
      <CardFooter>Last updated: 2026-03-20</CardFooter>
    </Card>
  ),
};
