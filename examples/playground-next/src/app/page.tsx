"use client";

import { defaultRegistry } from "@draftkit/core";
import { DraftKitShell } from "@draftkit/react";

export default function Page() {
  return (
    <DraftKitShell
      registry={defaultRegistry}
      onExportPng={() => {
        // MVP skeleton: PNG export pipeline will be added next.
        window.alert("PNG export는 다음 단계에서 연결합니다.");
      }}
    />
  );
}
