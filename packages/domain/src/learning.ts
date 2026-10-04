import type { Node } from "./catalog";
export type Progress =
  "NOT_STARTED" | "IN_PROGRESS" | "PRACTICED" | "VERIFIED" | "NEEDS_REVIEW";
export function validateGraph(nodes: Node[]): void {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  if (byId.size !== nodes.length) throw new Error("DUPLICATE_NODE");
  const visited = new Set<string>(),
    active = new Set<string>();
  function visit(id: string) {
    if (active.has(id)) throw new Error("CYCLE");
    if (visited.has(id)) return;
    const n = byId.get(id);
    if (!n) throw new Error("DANGLING_EDGE");
    active.add(id);
    n.prerequisites.forEach(visit);
    active.delete(id);
    visited.add(id);
    if (!n.challenge || !n.lesson) throw new Error("MISSING_CONTENT");
  }
  nodes.forEach((n) => visit(n.id));
}
export function nextActions(nodes: Node[], progress: Record<string, Progress>) {
  validateGraph(nodes);
  return nodes
    .filter(
      (n) =>
        progress[n.id] !== "VERIFIED" &&
        n.prerequisites.every((id) => progress[id] === "VERIFIED"),
    )
    .sort(
      (a, b) =>
        Number(progress[b.id] === "NEEDS_REVIEW") -
          Number(progress[a.id] === "NEEDS_REVIEW") ||
        a.effortMinutes - b.effortMinutes,
    )
    .slice(0, 3)
    .map((n) => ({
      nodeId: n.id,
      reason:
        progress[n.id] === "NEEDS_REVIEW" ? "REVIEW_DUE" : "PREREQUISITES_MET",
      challenge: n.challenge,
      lesson: n.lesson,
    }));
}
