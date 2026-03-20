import type { ComponentRegistry, DraftNode } from "./types";

function basePage(children: DraftNode[]): DraftNode {
  return {
    type: "Page",
    props: { padding: 24 },
    children: [
      {
        type: "Container",
        props: { maxWidth: 960, paddingX: 16 },
        children: [
          {
            type: "Stack",
            props: { gap: 16 },
            children,
          },
        ],
      },
    ],
  };
}

function simpleCard(): DraftNode {
  return {
    type: "Card",
    props: {},
    children: [
      {
        type: "CardHeader",
        props: {},
        children: [
          { type: "CardTitle", text: "Card Title" },
          { type: "CardDescription", text: "A short description of the card." },
        ],
      },
      {
        type: "CardContent",
        props: {},
        children: [
          { type: "Text", props: { size: "sm", tone: "muted" }, text: "Card content goes here." },
        ],
      },
    ],
  };
}

export function createMockDraft(
  prompt: string,
  registry: ComponentRegistry,
): DraftNode {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt === "simple card") {
    return pruneUnknownComponents(
      {
        type: "Page",
        props: { padding: 24 },
        children: [
          {
            type: "Container",
            props: { maxWidth: 380, paddingX: 16 },
            children: [simpleCard()],
          },
        ],
      },
      registry,
    );
  }

  const heroChildren: DraftNode[] = [
    { type: "Badge", props: { variant: "secondary" }, text: "DraftKit MVP" },
    {
      type: "Text",
      props: { size: "xl", weight: "bold" },
      text: "자연어로 UI 초안 생성",
    },
    {
      type: "Text",
      props: { size: "md", tone: "muted" },
      text: "이 화면은 실제 LLM 대신 mock generator로 만들어졌습니다.",
    },
  ];

  if (lowerPrompt.includes("form")) {
    heroChildren.push({
      type: "Card",
      props: {},
      children: [
        {
          type: "CardHeader",
          props: {},
          children: [
            { type: "CardTitle", text: "문의 폼" },
            { type: "CardDescription", text: "이름과 메시지를 입력하고 제출합니다." },
          ],
        },
        {
          type: "CardContent",
          props: {},
          children: [
            {
              type: "Stack",
              props: { gap: 12 },
              children: [
                { type: "Input", props: { placeholder: "이름" } },
                { type: "Input", props: { placeholder: "메시지" } },
                { type: "Button", text: "Submit", props: { variant: "default" } },
              ],
            },
          ],
        },
      ],
    });
  } else {
    heroChildren.push({
      type: "Inline",
      props: { gap: 8, align: "center", wrap: true },
      children: [
        { type: "Button", text: "기본 버튼", props: { variant: "default" } },
        { type: "Button", text: "보조 버튼", props: { variant: "outline" } },
      ],
    });
  }

  const draft = basePage(heroChildren);
  return pruneUnknownComponents(draft, registry);
}

function pruneUnknownComponents(
  node: DraftNode,
  registry: ComponentRegistry,
): DraftNode {
  const fallbackType = registry[node.type] ? node.type : "Text";
  const safeText =
    fallbackType === "Text" && !node.text
      ? `${node.type} 컴포넌트는 현재 registry에 없습니다.`
      : node.text;

  return {
    type: fallbackType,
    props: node.props,
    text: safeText,
    children: node.children?.map((child) => pruneUnknownComponents(child, registry)),
  };
}
