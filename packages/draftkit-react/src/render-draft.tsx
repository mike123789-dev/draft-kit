import type { DraftNode } from "@draftkit/core";
import React from "react";
import {
  Container,
  Divider,
  Grid,
  Inline,
  Page,
  Section,
  Spacer,
  Stack,
} from "./primitives";

function pickText(node: DraftNode, fallback: string): string {
  return node.text ?? fallback;
}

function styleFromProps(node: DraftNode): React.CSSProperties {
  const props = node.props ?? {};
  const style: React.CSSProperties = {};

  if (typeof props.gap === "number") style.gap = props.gap;
  if (typeof props.padding === "number") style.padding = props.padding;
  if (typeof props.paddingX === "number") {
    style.paddingLeft = props.paddingX;
    style.paddingRight = props.paddingX;
  }
  if (typeof props.paddingY === "number") {
    style.paddingTop = props.paddingY;
    style.paddingBottom = props.paddingY;
  }
  if (typeof props.maxWidth === "number") style.maxWidth = props.maxWidth;
  if (typeof props.columns === "number")
    style.gridTemplateColumns = `repeat(${props.columns}, minmax(0, 1fr))`;
  if (typeof props.background === "string") style.background = props.background;

  return style;
}

function renderChildren(node: DraftNode) {
  return node.children?.map((child, index) => (
    <React.Fragment key={`${child.type}-${index}`}>
      {renderDraftNode(child)}
    </React.Fragment>
  ));
}

export function renderDraftNode(node: DraftNode): React.ReactNode {
  const style = styleFromProps(node);
  switch (node.type) {
    case "Page":
      return <Page style={style}>{renderChildren(node)}</Page>;
    case "Section":
      return <Section style={style}>{renderChildren(node)}</Section>;
    case "Container":
      return <Container style={style}>{renderChildren(node)}</Container>;
    case "Stack":
      return <Stack style={style}>{renderChildren(node)}</Stack>;
    case "Inline":
      return <Inline style={style}>{renderChildren(node)}</Inline>;
    case "Grid":
      return <Grid style={style}>{renderChildren(node)}</Grid>;
    case "Spacer":
      return <Spacer style={style} />;
    case "Divider":
      return <Divider style={style} />;
    case "Card":
      return (
        <article
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 12,
            display: "grid",
            gap: 10,
            ...style,
          }}
        >
          <header style={{ display: "grid", gap: 4 }}>
            <strong>{String(node.props?.title ?? "Card")}</strong>
            {node.props?.description ? (
              <span style={{ color: "#6b7280", fontSize: 14 }}>
                {String(node.props.description)}
              </span>
            ) : null}
          </header>
          {renderChildren(node)}
        </article>
      );
    case "Button":
      return (
        <button
          type="button"
          style={{
            border: "1px solid #111827",
            borderRadius: 8,
            padding: "8px 12px",
            background: node.props?.variant === "outline" ? "transparent" : "#111827",
            color: node.props?.variant === "outline" ? "#111827" : "#ffffff",
            ...style,
          }}
        >
          {pickText(node, "Button")}
        </button>
      );
    case "Badge":
      return (
        <span
          style={{
            display: "inline-flex",
            width: "fit-content",
            borderRadius: 9999,
            fontSize: 12,
            padding: "4px 8px",
            background: "#e2e8f0",
            ...style,
          }}
        >
          {pickText(node, "Badge")}
        </span>
      );
    case "Input":
      return (
        <input
          placeholder={String(node.props?.placeholder ?? "")}
          style={{
            width: "100%",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            padding: "8px 10px",
            ...style,
          }}
        />
      );
    case "Text":
      return (
        <p
          style={{
            margin: 0,
            color: node.props?.tone === "muted" ? "#6b7280" : "#0f172a",
            fontSize: node.props?.size === "xl" ? 30 : node.props?.size === "md" ? 16 : 14,
            fontWeight: node.props?.weight === "bold" ? 700 : 400,
            ...style,
          }}
        >
          {pickText(node, "")}
        </p>
      );
    default:
      return (
        <p style={{ color: "crimson", margin: 0 }}>
          Unknown component: {node.type}
        </p>
      );
  }
}
