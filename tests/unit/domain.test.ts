import { describe, it, expect } from "vitest";
import { dsaNodes } from "../../packages/domain/src/catalog";
import { validateGraph, nextActions } from "../../packages/domain/src/learning";
import {
  enrollSchema,
  draftSchema,
  assistantInputSchema,
} from "../../packages/contracts/src";
import {
  UnavailableRunner,
  applyJobState,
} from "../../packages/domain/src/execution";
import * as Y from "yjs";
describe("learning invariants", () => {
  it("rejects dangling edges and cycles", () => {
    expect(() =>
      validateGraph([{ ...dsaNodes[0]!, prerequisites: ["missing"] }]),
    ).toThrow("DANGLING");
    expect(() =>
      validateGraph([{ ...dsaNodes[0]!, prerequisites: ["arrays"] }]),
    ).toThrow("CYCLE");
  });
  it("only trusted verified prerequisites unlock next action", () => {
    expect(
      nextActions(dsaNodes, { arrays: "PRACTICED" }).map((x) => x.nodeId),
    ).toEqual(["arrays"]);
    expect(
      nextActions(dsaNodes, { arrays: "VERIFIED" }).map((x) => x.nodeId),
    ).toEqual(["two-pointers"]);
  });
  it("rejects forged actor or verdict, oversized input", () => {
    expect(
      enrollSchema.safeParse({
        trackSlug: "dsa",
        roadmapVersion: "dsa-v1",
        requestId: crypto.randomUUID(),
        ownerUid: "victim",
      }).success,
    ).toBe(false);
    expect(
      draftSchema.safeParse({
        source: "x",
        language: "javascript",
        challengeRevision: "peak-requests-v1",
        context: "learning",
        revision: 1,
        verdict: "ACCEPTED",
      }).success,
    ).toBe(false);
    expect(
      assistantInputSchema.safeParse({
        message: "x".repeat(8001),
        locale: "vi",
        clientRequestId: crypto.randomUUID(),
      }).success,
    ).toBe(false);
  });
});
describe("runner boundary", () => {
  it("never returns a fake verdict without provider", async () => {
    await expect(
      new UnavailableRunner().submit({
        source: "x",
        runtimeId: "js",
        input: "",
        sourceHash: "hash",
        requestId: "id",
      }),
    ).rejects.toThrow("BLOCKED_EXTERNAL");
  });
  it("rejects late state regression and accepts duplicate", () => {
    expect(() => applyJobState("EVALUATED", "RUNNING")).toThrow();
    expect(applyJobState("EVALUATED", "EVALUATED")).toBe("EVALUATED");
  });
});
describe("CRDT spike — in-memory only, not Firebase transport evidence", () => {
  it("converges on simultaneous edits with duplicate/out-of-order updates", () => {
    const a = new Y.Doc(),
      b = new Y.Doc();
    const initial = new Y.Doc();
    initial.getText("code").insert(0, "base");
    const seed = Y.encodeStateAsUpdate(initial);
    Y.applyUpdate(a, seed);
    Y.applyUpdate(b, seed);
    a.getText("code").insert(2, "A");
    b.getText("code").delete(1, 2);
    b.getText("code").insert(1, "B");
    const ua = Y.encodeStateAsUpdate(a),
      ub = Y.encodeStateAsUpdate(b);
    Y.applyUpdate(a, ub);
    Y.applyUpdate(a, ub);
    Y.applyUpdate(b, ua);
    expect(a.getText("code").toString()).toBe(b.getText("code").toString());
    const late = new Y.Doc();
    Y.applyUpdate(late, Y.encodeStateAsUpdate(a));
    expect(late.getText("code").toString()).toBe(a.getText("code").toString());
    [a, b, initial, late].forEach((d) => d.destroy());
  });
});
