import { expect, it } from "vitest";
import { learningRequest } from "../../packages/contracts/src/progress";
import {
  learningTopics,
  validLearningPath,
} from "../../packages/domain/src/progress";
it("topic identities are stable single Firestore path segments", () => {
  expect(learningTopics.length).toBe(18);
  expect(new Set(learningTopics.map((t) => t.id)).size).toBe(18);
  expect(learningTopics.every((t) => /^[a-z0-9-]+$/.test(t.id))).toBe(true);
});
it("self-reported status never permits verified mastery or ownership fields", () => {
  const data = {
    action: "status",
    topicId: learningTopics[0]!.id,
    status: "REVIEWED",
    requestId: crypto.randomUUID(),
  };
  expect(learningRequest.safeParse(data).success).toBe(true);
  expect(
    learningRequest.safeParse({ ...data, status: "VERIFIED" }).success,
  ).toBe(false);
  expect(
    learningRequest.safeParse({ ...data, ownerUid: "other" }).success,
  ).toBe(false);
});
it("resume accepts only real local learning paths, never external or arbitrary routes", () => {
  expect(validLearningPath("/learn/request-window", new Set())).toBe(true);
  expect(validLearningPath("/practice/two-sum", new Set(["two-sum"]))).toBe(
    true,
  );
  for (const p of [
    "https://other.test",
    "/admin",
    "/practice/unknown",
    "/learn/unknown",
    "//example.test",
  ]) {
    expect(validLearningPath(p, new Set())).toBe(false);
  }
});
