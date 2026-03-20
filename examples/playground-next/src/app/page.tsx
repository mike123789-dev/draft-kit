"use client";

import { defaultRegistry } from "@draftkit/core";
import { DraftKitShell } from "@draftkit/react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Text is not in the UI library — provide a simple stub for live preview
const Text = ({
  children,
  size,
  weight,
  tone,
}: {
  children?: React.ReactNode;
  size?: string;
  weight?: string;
  tone?: string;
}) => (
  <span
    style={{
      fontWeight: weight === "bold" ? 700 : weight === "semibold" ? 600 : undefined,
      fontSize: size === "xl" ? "1.25rem" : size === "lg" ? "1.125rem" : size === "sm" ? "0.875rem" : size === "xs" ? "0.75rem" : undefined,
      color: tone === "muted" ? "var(--muted-foreground)" : tone === "danger" ? "var(--destructive)" : undefined,
    }}
  >
    {children}
  </span>
);

const playgroundComponents: Record<string, unknown> = {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Text,
};

export default function Page() {
  return (
    <DraftKitShell
      registry={defaultRegistry}
      components={playgroundComponents}
      onExportPng={() => {
        window.alert("PNG export는 다음 단계에서 연결합니다.");
      }}
    />
  );
}
