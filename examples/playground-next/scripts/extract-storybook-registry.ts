import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

type DraftkitParameters = {
  importPath: string;
  source: "example";
  group: "ui" | "draftkit";
  componentName?: string;
  description?: string;
};

type StoryMeta = {
  title?: string;
  argTypes?: Record<string, { control?: unknown }>;
  parameters?: {
    draftkit?: DraftkitParameters;
  };
};

type RegistryEntry = {
  title: string;
  componentName: string;
  importPath: string;
  group: "ui" | "draftkit";
  description?: string;
  props: string[];
  source: "example";
};

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const OUTPUT_DIR = path.join(ROOT, "src", "registry");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "storybook-registry.json");

async function listStoryFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listStoryFiles(fullPath)));
      continue;
    }
    if (entry.isFile() && /\.stories\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function toComponentName(title: string): string {
  const candidate = title.split("/").at(-1) ?? title;
  return candidate.replace(/\s+/g, "");
}

async function buildRegistry(): Promise<RegistryEntry[]> {
  const files = await listStoryFiles(SRC_DIR);
  const registry: RegistryEntry[] = [];

  for (const file of files) {
    const modulePath = pathToFileURL(file).href;
    const mod: Record<string, unknown> = await import(modulePath);
    const meta = (mod.default ?? {}) as StoryMeta;
    const draftkit = meta.parameters?.draftkit;

    if (!meta.title || !draftkit) {
      continue;
    }

    const props = Object.keys(meta.argTypes ?? {}).sort();
    registry.push({
      title: meta.title,
      componentName: draftkit.componentName ?? toComponentName(meta.title),
      importPath: draftkit.importPath,
      group: draftkit.group,
      description: draftkit.description,
      props,
      source: "example",
    });
  }

  registry.sort((a, b) => a.title.localeCompare(b.title));
  return registry;
}

async function main() {
  const registry = await buildRegistry();
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf-8");
  console.log(`Extracted ${registry.length} registry entries to ${OUTPUT_PATH}`);
}

main().catch((error: unknown) => {
  console.error("Failed to extract Storybook registry:", error);
  process.exit(1);
});
