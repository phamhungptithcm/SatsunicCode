import { dsaGraph } from "./dsa-catalog";
export const learningTopics = dsaGraph.map((t) => ({
  ...t,
  id: t.topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
}));
export function validLearningPath(
  path: string,
  referenceSlugs: ReadonlySet<string>,
) {
  if (
    path === "/learn/request-window" ||
    path === "/practice/peak-requests" ||
    path === "/practice/duplicate-check"
  )
    return true;
  const match = /^\/practice\/([a-z0-9-]+)$/.exec(path);
  return !!match && referenceSlugs.has(match[1]!);
}
