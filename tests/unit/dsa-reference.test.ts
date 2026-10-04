import { describe, it, expect } from "vitest";
import {
  dsaProblems,
  dsaGraph,
  problemsFor,
} from "../../packages/domain/src/dsa-catalog";
describe("DSA reference catalog", () => {
  it("preserves full reference inventory and collection membership", () => {
    expect(dsaProblems).toHaveLength(450);
    expect(new Set(dsaProblems.map(p => p.slug)).size).toBe(450);
    expect(problemsFor("neetcode150")).toHaveLength(150);
    expect(problemsFor("blind75")).toHaveLength(75);
    for (const p of dsaProblems) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.contentState).toBe("REFERENCE_ONLY");
      expect(p.externalUrl).toMatch(/^https:\/\/leetcode.com\/problems\//);
      expect(dsaGraph.some(n => n.topic === p.topic) || p.topic === "JavaScript").toBe(true);
    }
  });
  it("has a complete acyclic reference graph", () => {
    const done = new Set<string>(),
      active = new Set<string>();
    function visit(id: string) {
      if (active.has(id)) throw Error("Cycle");
      if (done.has(id)) return;
      const n = dsaGraph.find((n) => n.topic === id);
      expect(n).toBeDefined();
      active.add(id);
      for (const p of n!.parents) visit(p);
      active.delete(id);
      done.add(id);
    }
    for (const n of dsaGraph) visit(n.topic);
    expect(done.size).toBe(18);
  });
});
