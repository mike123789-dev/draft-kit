import React from "react";

type BaseProps = React.PropsWithChildren<{
  style?: React.CSSProperties;
}>;

export function Page({ children, style }: BaseProps) {
  return (
    <div
      style={{
        minHeight: "100%",
        background: "var(--background)",
        color: "var(--foreground)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Section({ children, style }: BaseProps) {
  return <section style={{ ...style }}>{children}</section>;
}

export function Container({ children, style }: BaseProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Stack({ children, style }: BaseProps) {
  return <div style={{ display: "grid", gap: 12, ...style }}>{children}</div>;
}

export function Inline({ children, style }: BaseProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Grid({ children, style }: BaseProps) {
  return <div style={{ display: "grid", gap: 12, ...style }}>{children}</div>;
}

export function Spacer({ style }: { style?: React.CSSProperties }) {
  return <div style={{ height: 8, ...style }} />;
}

export function Divider({ style }: { style?: React.CSSProperties }) {
  return <hr style={{ borderColor: "var(--border)", ...style }} />;
}
