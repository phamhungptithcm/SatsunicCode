import { describe, expect, it } from "vitest";
import {
  draftKey,
  parseDraft,
} from "../../apps/web/src/features/workspace/drafts";
describe("workspace local drafts", () => {
  it("separates owner, problem and language including delimiter characters", () => {
    expect(draftKey("a:b", "c", "python")).not.toBe(
      draftKey("a", "b:c", "python"),
    );
    expect(draftKey("a", "c", "python")).not.toBe(draftKey("b", "c", "python"));
    expect(draftKey("a", "c", "python")).not.toBe(draftKey("a", "c", "java"));
  });
  it("rejects corrupt, oversized and invalid-revision stored data", () => {
    for (const value of [
      "null",
      "{",
      JSON.stringify({ source: "x", revision: -1, updatedAt: 1 }),
      JSON.stringify({ source: "x".repeat(100001), revision: 0, updatedAt: 1 }),
    ])
      expect(parseDraft(value)).toBeNull();
    expect(
      parseDraft(JSON.stringify({ source: "", revision: 0, updatedAt: 1 })),
    ).toEqual({ source: "", revision: 0, updatedAt: 1 });
  });
});

import { executionInputSchema } from "../../packages/contracts/src";
describe("execution request trust contract", () => {
  const request = {
    problemRevision: "duplicate-check-v1",
    source: "pass",
    language: "python",
    requestId: "550e8400-e29b-41d4-a716-446655440000",
    mode: "run",
  };
  it("rejects forged verdicts, unsupported content and hidden-case custom input", () => {
    expect(
      executionInputSchema.safeParse({ ...request, verdict: "ACCEPTED" })
        .success,
    ).toBe(false);
    expect(
      executionInputSchema.safeParse({
        ...request,
        problemRevision: "unreviewed",
      }).success,
    ).toBe(false);
    expect(
      executionInputSchema.safeParse({
        ...request,
        mode: "submit",
        customInput: "[]",
      }).success,
    ).toBe(false);
    expect(
      executionInputSchema.safeParse({ ...request, source: "x".repeat(100001) })
        .success,
    ).toBe(false);
    expect(
      executionInputSchema.safeParse({ ...request, customInput: "[]" }).success,
    ).toBe(true);
  });
});
