"use client";

import { defaultRegistry, type ComponentRegistry } from "@draftkit/core";
import { DraftKitShell } from "@draftkit/react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const playgroundRegistry: ComponentRegistry = {
  ...defaultRegistry,
  Badge: { ...defaultRegistry.Badge, component: Badge },
  Button: { ...defaultRegistry.Button, component: Button },
  Card: { ...defaultRegistry.Card, component: Card },
  CardHeader: { name: "CardHeader", allowedProps: [], children: { allowed: true }, component: CardHeader },
  CardTitle: { name: "CardTitle", allowedProps: [], children: { allowed: true }, component: CardTitle },
  CardDescription: { name: "CardDescription", allowedProps: [], children: { allowed: true }, component: CardDescription },
  CardContent: { name: "CardContent", allowedProps: [], children: { allowed: true }, component: CardContent },
  Input: { ...defaultRegistry.Input, component: Input },
  Label: { name: "Label", allowedProps: ["htmlFor"], children: { allowed: true }, component: Label },
  Separator: { name: "Separator", allowedProps: ["orientation"], children: { allowed: false }, component: Separator },
  Tabs: { name: "Tabs", allowedProps: ["defaultValue"], children: { allowed: true }, component: Tabs },
  TabsList: { name: "TabsList", allowedProps: [], children: { allowed: true }, component: TabsList },
  TabsTrigger: { name: "TabsTrigger", allowedProps: ["value"], children: { allowed: true }, component: TabsTrigger },
  TabsContent: { name: "TabsContent", allowedProps: ["value"], children: { allowed: true }, component: TabsContent },
  Text: { ...defaultRegistry.Text, component: Text },
};

export default function Page() {
  return (
    <DraftKitShell
      registry={playgroundRegistry}
      onExportPng={() => {
        window.alert("PNG export는 다음 단계에서 연결합니다.");
      }}
    />
  );
}
