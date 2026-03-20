import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DraftKit Playground",
  description: "DraftKit minimal skeleton app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
