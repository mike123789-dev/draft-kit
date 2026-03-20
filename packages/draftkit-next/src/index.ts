import {
  createMockDraft,
  defaultRegistry,
  serializeDraftToJsx,
  validateDraft,
} from "@draftkit/core";

export type DraftKitGenerateResponse = {
  jsx: string;
  validationOk: boolean;
  firstIssue?: string;
};

export function generateDraftResponse(prompt: string): DraftKitGenerateResponse {
  const draft = createMockDraft(prompt, defaultRegistry);
  const validation = validateDraft(draft, defaultRegistry);

  return {
    jsx: serializeDraftToJsx(draft),
    validationOk: validation.ok,
    firstIssue: validation.issues[0]?.message,
  };
}
