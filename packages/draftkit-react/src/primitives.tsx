import React from "react";

type PageProps = React.PropsWithChildren<{
  padding?: number;
  background?: string;
  style?: React.CSSProperties;
}>;

export function Page({ children, padding = 0, background = "var(--background)", style }: PageProps) {
  return (
    <div
      style={{
        minHeight: "100%",
        padding: padding ? `${padding}px` : undefined,
        background,
        color: "var(--foreground)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type SectionProps = React.PropsWithChildren<{
  paddingY?: number;
  background?: string;
  style?: React.CSSProperties;
}>;

export function Section({ children, paddingY = 0, background = "transparent", style }: SectionProps) {
  return (
    <section
      style={{
        paddingTop: paddingY ? `${paddingY}px` : undefined,
        paddingBottom: paddingY ? `${paddingY}px` : undefined,
        background,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

type ContainerProps = React.PropsWithChildren<{
  maxWidth?: number;
  paddingX?: number;
  style?: React.CSSProperties;
}>;

export function Container({ children, maxWidth = 960, paddingX = 0, style }: ContainerProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: `${maxWidth}px`,
        margin: "0 auto",
        paddingLeft: paddingX ? `${paddingX}px` : undefined,
        paddingRight: paddingX ? `${paddingX}px` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type StackProps = React.PropsWithChildren<{
  gap?: number;
  align?: string;
  justify?: string;
  style?: React.CSSProperties;
}>;

export function Stack({ children, gap = 12, align, justify, style }: StackProps) {
  return (
    <div
      style={{
        display: "grid",
        gap: `${gap}px`,
        alignItems: align,
        justifyContent: justify,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type InlineProps = React.PropsWithChildren<{
  gap?: number;
  align?: string;
  justify?: string;
  wrap?: boolean;
  style?: React.CSSProperties;
}>;

export function Inline({ children, gap = 12, align = "center", justify, wrap = true, style }: InlineProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: wrap ? "wrap" : "nowrap",
        gap: `${gap}px`,
        alignItems: align,
        justifyContent: justify,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type GridProps = React.PropsWithChildren<{
  columns?: number;
  gap?: number;
  style?: React.CSSProperties;
}>;

export function Grid({ children, columns = 1, gap = 12, style }: GridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns},1fr)`,
        gap: `${gap}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type SpacerProps = {
  size?: number;
  style?: React.CSSProperties;
};

export function Spacer({ size = 8, style }: SpacerProps) {
  return <div style={{ height: `${size}px`, ...style }} />;
}

type DividerProps = {
  marginY?: number;
  style?: React.CSSProperties;
};

export function Divider({ marginY = 0, style }: DividerProps) {
  return (
    <hr
      style={{
        borderColor: "var(--border)",
        marginTop: marginY ? `${marginY}px` : undefined,
        marginBottom: marginY ? `${marginY}px` : undefined,
        ...style,
      }}
    />
  );
}
