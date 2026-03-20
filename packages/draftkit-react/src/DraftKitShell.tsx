"use client";

import {
  createMockDraft,
  serializeDraftToComponent,
  serializeDraftToJsxExpression,
  type ComponentRegistry,
  type DraftNode,
} from "@draftkit/core";
import { useState } from "react";
import { LiveEditor, LiveProvider } from "react-live";

import type { PipelineResult } from "./jsx-pipeline";
import { validateAndRenderJSX } from "./jsx-pipeline";

// ---------------------------------------------------------------------------
// Pure helpers (exported for testing)
// ---------------------------------------------------------------------------

export function renderPreviewContent(result: PipelineResult | null) {
  if (!result) {
    return (
      <p style={{ color: "#6b7280" }}>
        아직 draft가 없습니다. 왼쪽에서 프리셋을 선택해주세요.
      </p>
    );
  }
  if (result.ok) {
    return result.element;
  }
  return (
    <p style={{ color: "#dc2626" }}>
      {result.issues[0]?.message ?? "Unknown validation error"}
    </p>
  );
}

export function validationStatusText(result: PipelineResult | null): string {
  if (!result) return "아직 생성 전입니다.";
  if (result.ok) return "검증 통과";
  return `검증 실패: ${result.issues[0]?.message ?? "알 수 없는 에러"}`;
}

// ---------------------------------------------------------------------------
// Preset definitions
// ---------------------------------------------------------------------------

const PRESETS = [
  { label: "Mini", prompt: "simple card" },
  { label: "Small", prompt: "card with title and description" },
  { label: "Medium", prompt: "settings form with multiple fields" },
] as const;

// ---------------------------------------------------------------------------
// Shell component
// ---------------------------------------------------------------------------

type DraftKitShellProps = {
  registry: ComponentRegistry;
  onExportPng?: () => void;
};

export function DraftKitShell({ registry, onExportPng }: DraftKitShellProps) {
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [editorCode, setEditorCode] = useState("");
  const [draft, setDraft] = useState<DraftNode | null>(null);
  const [copied, setCopied] = useState(false);

  function handlePreset(prompt: string) {
    const generated = createMockDraft(prompt, registry);
    const jsxCode = serializeDraftToJsxExpression(generated);
    setDraft(generated);
    setEditorCode(jsxCode);
    setPipelineResult(validateAndRenderJSX(jsxCode, registry));
  }

  function handleRun() {
    setPipelineResult(validateAndRenderJSX(editorCode, registry));
  }

  async function handleCopyCode() {
    const text = draft
      ? serializeDraftToComponent(draft, registry)
      : editorCode;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard permission denied or unavailable — silently ignore
    }
  }

  const validStatus = pipelineResult === null ? "idle" : pipelineResult.ok ? "pass" : "fail";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Berkeley+Mono:ital,wght@0,100..700;1,100..700&family=Syne:wght@400;600;700;800&display=swap');

        .dk-shell * { box-sizing: border-box; }

        .dk-shell {
          --bg:          #0b0b0e;
          --surface:     #111115;
          --surface2:    #18181e;
          --border:      #26262e;
          --border-hi:   #3a3a48;
          --text:        #e2dfd8;
          --muted:       #6b6878;
          --accent:      #e8a020;
          --accent-dim:  rgba(232,160,32,0.12);
          --accent-glow: rgba(232,160,32,0.25);
          --pass:        #34d399;
          --pass-dim:    rgba(52,211,153,0.1);
          --fail:        #f87171;
          --fail-dim:    rgba(248,113,113,0.1);
          font-family: 'Syne', 'SF Pro Display', system-ui, sans-serif;
          min-height: 100dvh;
          display: grid;
          grid-template-columns: 360px 1fr;
          background: var(--bg);
          color: var(--text);
        }

        /* ── Sidebar ── */
        .dk-sidebar {
          border-right: 1px solid var(--border);
          padding: 0;
          display: flex;
          flex-direction: column;
          background: var(--surface);
          overflow: hidden;
        }

        .dk-logo {
          padding: 20px 24px 18px;
          border-bottom: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .dk-logo-mark {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          font-family: 'Berkeley Mono', 'SF Mono', Menlo, monospace;
        }
        .dk-logo-title {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text);
          line-height: 1;
        }

        /* ── Sections ── */
        .dk-section {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
        }
        .dk-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
          font-family: 'Berkeley Mono', 'SF Mono', Menlo, monospace;
          margin-bottom: 10px;
        }

        /* ── Preset chips ── */
        .dk-presets {
          display: flex;
          gap: 6px;
        }
        .dk-preset {
          flex: 1;
          padding: 8px 10px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text);
          font-family: 'Syne', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }
        .dk-preset:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-dim);
          box-shadow: 0 0 12px var(--accent-glow);
        }
        .dk-preset:active { transform: scale(0.97); }

        /* ── Action buttons ── */
        .dk-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .dk-btn {
          padding: 9px 14px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text);
          font-family: 'Berkeley Mono', 'SF Mono', Menlo, monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dk-btn:hover:not(:disabled) {
          border-color: var(--border-hi);
          color: var(--text);
          background: #1e1e26;
        }
        .dk-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .dk-btn[data-copied="true"] {
          border-color: var(--pass);
          color: var(--pass);
          background: var(--pass-dim);
        }
        .dk-btn-primary {
          background: var(--accent);
          border-color: var(--accent);
          color: #0b0b0e;
          font-weight: 700;
          grid-column: span 2;
        }
        .dk-btn-primary:hover:not(:disabled) {
          background: #f0b030;
          border-color: #f0b030;
          box-shadow: 0 0 18px var(--accent-glow);
        }
        .dk-btn-primary:disabled {
          background: var(--surface2);
          border-color: var(--border);
          color: var(--muted);
          box-shadow: none;
        }

        /* ── Validation badge ── */
        .dk-validation {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-family: 'Berkeley Mono', 'SF Mono', Menlo, monospace;
          border: 1px solid var(--border);
          background: var(--surface2);
          transition: all 0.2s ease;
        }
        .dk-validation[data-status="pass"] {
          border-color: var(--pass);
          background: var(--pass-dim);
          color: var(--pass);
        }
        .dk-validation[data-status="fail"] {
          border-color: var(--fail);
          background: var(--fail-dim);
          color: var(--fail);
        }
        .dk-validation[data-status="idle"] {
          color: var(--muted);
        }
        .dk-validation-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }
        .dk-validation[data-status="pass"] .dk-validation-dot {
          box-shadow: 0 0 6px var(--pass);
          animation: dk-pulse 2s infinite;
        }
        @keyframes dk-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ── Code panel ── */
        .dk-code-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-top: 1px solid var(--border);
        }
        .dk-code-header {
          padding: 8px 24px;
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
        }
        .dk-code-dot {
          width: 8px; height: 8px; border-radius: 50%;
        }
        .dk-code-filename {
          font-size: 11px;
          font-family: 'Berkeley Mono', 'SF Mono', Menlo, monospace;
          color: var(--muted);
          margin-left: 4px;
        }
        .dk-code {
          flex: 1;
          margin: 0;
          padding: 16px 24px;
          background: var(--bg);
          color: #a8b8c8;
          font-family: 'Berkeley Mono', 'SF Mono', Menlo, monospace;
          font-size: 11.5px;
          line-height: 1.7;
          white-space: pre-wrap;
          overflow-y: auto;
          overflow-x: hidden;
          word-break: break-all;
        }
        .dk-code-empty {
          color: var(--muted);
          font-style: italic;
        }
        .dk-code::-webkit-scrollbar { width: 4px; }
        .dk-code::-webkit-scrollbar-track { background: transparent; }
        .dk-code::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 2px; }

        /* ── Preview panel ── */
        .dk-preview {
          position: relative;
          overflow: hidden;
          background: var(--bg);
          background-image:
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(232,160,32,0.06) 0%, transparent 70%),
            radial-gradient(circle at 80% 80%, rgba(99,102,241,0.04) 0%, transparent 50%);
        }
        .dk-canvas-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.4;
        }
        .dk-canvas-frame {
          position: absolute;
          inset: 32px;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow:
            0 0 0 1px var(--border-hi),
            0 24px 64px rgba(0,0,0,0.6),
            0 4px 16px rgba(0,0,0,0.4);
        }
        .dk-canvas-titlebar {
          height: 36px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 14px;
          gap: 7px;
          flex-shrink: 0;
        }
        .dk-titlebar-dot {
          width: 11px; height: 11px; border-radius: 50%;
        }
        .dk-canvas-url {
          flex: 1;
          margin: 0 12px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 4px;
          height: 20px;
          display: flex;
          align-items: center;
          padding: 0 8px;
        }
        .dk-canvas-url-text {
          font-size: 10px;
          font-family: 'Berkeley Mono', 'SF Mono', Menlo, monospace;
          color: var(--muted);
        }
        .dk-canvas-content {
          flex: 1;
          overflow: auto;
          padding: 24px;
          background: oklch(0.97 0 0);
        }
        .dk-canvas-content::-webkit-scrollbar { width: 4px; }
        .dk-canvas-content::-webkit-scrollbar-track { background: transparent; }
        .dk-canvas-content::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }

        .dk-empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #9ca3af;
          font-family: 'Syne', system-ui, sans-serif;
        }
        .dk-empty-icon {
          width: 48px; height: 48px;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }
        .dk-empty-text {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
        }
        .dk-empty-sub {
          font-size: 12px;
          color: #9ca3af;
          text-align: center;
          max-width: 180px;
          line-height: 1.5;
        }
      `}</style>

      <main className="dk-shell">
        {/* ── Sidebar ── */}
        <aside className="dk-sidebar">
          <div className="dk-logo">
            <span className="dk-logo-mark">◆ DraftKit</span>
            <span className="dk-logo-title">Playground</span>
          </div>

          {/* Presets */}
          <div className="dk-section">
            <div className="dk-section-label">Presets</div>
            <div className="dk-presets">
              {PRESETS.map(({ label, prompt }) => (
                <button
                  key={label}
                  type="button"
                  className="dk-preset"
                  onClick={() => handlePreset(prompt)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="dk-section">
            <div className="dk-section-label">Actions</div>
            <div className="dk-actions">
              <button
                type="button"
                className="dk-btn dk-btn-primary"
                onClick={handleRun}
                disabled={!editorCode}
              >
                ▶ Run
              </button>
              <button
                type="button"
                className="dk-btn"
                onClick={handleCopyCode}
                disabled={!draft && !editorCode}
                data-copied={copied}
              >
                {copied ? "✓ Copied!" : "⎘ Copy JSX"}
              </button>
              <button type="button" className="dk-btn" onClick={onExportPng}>
                ↗ Export PNG
              </button>
            </div>
          </div>

          {/* Validation */}
          <div className="dk-section">
            <div className="dk-section-label">Validation</div>
            <div className="dk-validation" data-status={validStatus}>
              <span className="dk-validation-dot" />
              {validationStatusText(pipelineResult)}
            </div>
          </div>

          {/* JSX source — LiveEditor (AC-5/AC-6) */}
          <div className="dk-code-wrap">
            <div className="dk-code-header">
              <span className="dk-code-dot" style={{ background: "#ff5f57" }} />
              <span className="dk-code-dot" style={{ background: "#febc2e" }} />
              <span className="dk-code-dot" style={{ background: "#28c840" }} />
              <span className="dk-code-filename">output.jsx</span>
            </div>
            <LiveProvider code={editorCode} language="jsx">
              <LiveEditor
                className="dk-code"
                onChange={(code) => { setEditorCode(code); setDraft(null); }}
              />
            </LiveProvider>
          </div>
        </aside>

        {/* ── Preview ── */}
        <section className="dk-preview" aria-label="overlay preview">
          <div className="dk-canvas-bg" />
          <div className="dk-canvas-frame">
            <div className="dk-canvas-titlebar">
              <span className="dk-titlebar-dot" style={{ background: "#ff5f57" }} />
              <span className="dk-titlebar-dot" style={{ background: "#febc2e" }} />
              <span className="dk-titlebar-dot" style={{ background: "#28c840" }} />
              <div className="dk-canvas-url">
                <span className="dk-canvas-url-text">localhost:3000 — live preview</span>
              </div>
            </div>
            <div className="dk-canvas-content">
              {pipelineResult === null ? (
                <div className="dk-empty-state">
                  <div className="dk-empty-icon">✦</div>
                  <span className="dk-empty-text">No draft yet</span>
                  <span className="dk-empty-sub">Pick a preset or write JSX and hit Run</span>
                </div>
              ) : pipelineResult.ok ? (
                pipelineResult.element
              ) : (
                <div className="dk-empty-state">
                  <div className="dk-empty-icon" style={{ borderColor: "#fca5a5" }}>✕</div>
                  <span className="dk-empty-text" style={{ color: "#f87171" }}>Validation failed</span>
                  <span className="dk-empty-sub" style={{ color: "#f87171" }}>
                    {pipelineResult.issues[0]?.message ?? "Unknown error"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
