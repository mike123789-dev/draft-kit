"use client";

import {
  createMockDraft,
  serializeDraftToJsx,
  validateDraft,
  type ComponentRegistry,
  type DraftNode,
} from "@draftkit/core";
import { startTransition, useDeferredValue, useState } from "react";
import { renderDraftNode } from "./render-draft";

type DraftKitShellProps = {
  registry: ComponentRegistry;
  onExportPng?: () => void;
};

export function DraftKitShell({ registry, onExportPng }: DraftKitShellProps) {
  const [prompt, setPrompt] = useState("landing hero 만들어줘");
  const [draft, setDraft] = useState<DraftNode | null>(null);
  const [jsxCode, setJsxCode] = useState("");
  const [validationMessage, setValidationMessage] = useState(
    "아직 생성 전입니다.",
  );
  const deferredPrompt = useDeferredValue(prompt);

  function handleGenerate() {
    startTransition(() => {
      const nextDraft = createMockDraft(prompt, registry);
      const validation = validateDraft(nextDraft, registry);
      setDraft(nextDraft);
      setJsxCode(serializeDraftToJsx(nextDraft));
      setValidationMessage(
        validation.ok
          ? "검증 통과"
          : `검증 실패: ${validation.issues[0]?.message ?? "알 수 없는 에러"}`,
      );
    });
  }

  async function handleCopyCode() {
    if (!jsxCode) return;
    await navigator.clipboard.writeText(jsxCode);
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: "380px 1fr",
        background: "linear-gradient(160deg, #f8fafc 0%, #eef2ff 100%)",
      }}
    >
      <aside
        style={{
          borderRight: "1px solid var(--border)",
          padding: 16,
          display: "grid",
          gap: 12,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(8px)",
        }}
      >
        <h1 style={{ fontSize: 20 }}>DraftKit Playground</h1>
        <p style={{ color: "color-mix(in oklab, var(--foreground) 65%, #0000)" }}>
          프롬프트를 입력하면 mock draft를 생성하고 바로 오버레이로 보여줍니다.
        </p>
        <label htmlFor="prompt">Prompt</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          style={{
            minHeight: 110,
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 10,
            resize: "vertical",
            font: "inherit",
          }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={handleGenerate}>
            Generate Draft
          </button>
          <button type="button" onClick={handleCopyCode} disabled={!jsxCode}>
            Copy JSX
          </button>
          <button type="button" onClick={onExportPng}>
            Export PNG (TODO)
          </button>
        </div>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 10,
            fontSize: 14,
          }}
        >
          <strong>Validation:</strong> {validationMessage}
          <br />
          <strong>Deferred Prompt:</strong> {deferredPrompt}
        </div>
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 10,
            fontSize: 12,
            maxHeight: 240,
            overflow: "auto",
          }}
        >
          {jsxCode || "// Generate를 누르면 JSX가 여기에 표시됩니다."}
        </pre>
      </aside>

      <section
        aria-label="overlay preview"
        style={{ position: "relative", padding: 24, overflow: "hidden" }}
      >
        <div
          style={{
            position: "absolute",
            inset: 24,
            borderRadius: 16,
            border: "1px dashed color-mix(in oklab, var(--foreground) 20%, #0000)",
            background:
              "repeating-linear-gradient(45deg, #ffffff 0 16px, #f8fafc 16px 32px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 40,
            borderRadius: 16,
            border: "1px solid var(--border)",
            background: "white",
            overflow: "auto",
            padding: 16,
          }}
        >
          {draft ? (
            renderDraftNode(draft)
          ) : (
            <p style={{ color: "#6b7280" }}>
              아직 draft가 없습니다. 왼쪽에서 Generate Draft를 눌러주세요.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
