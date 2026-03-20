import "@storybook/types";

declare module "@storybook/types" {
  interface Parameters {
    draftkit?: {
      importPath: string;
      source: "example";
      group: "ui" | "draftkit";
      componentName?: string;
      description?: string;
    };
  }
}
