import { z } from "zod/v3";
export const learningRequest = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("status"),
      topicId: z.string().min(1).max(80),
      status: z.enum(["NOT_STARTED", "LEARNING", "REVIEWED", "NEEDS_REVIEW"]),
      requestId: z.string().uuid(),
    })
    .strict(),
  z
    .object({
      action: z.literal("activity"),
      path: z.string().min(1).max(180),
      requestId: z.string().uuid(),
    })
    .strict(),
]);
export type LearningStatus =
  "NOT_STARTED" | "LEARNING" | "REVIEWED" | "NEEDS_REVIEW";
export type ProgressSummary = {
  activePlan: string | null;
  statuses: Record<string, LearningStatus>;
  resume: string | null;
  drafts: { id: string; language: string; challengeRevision: string }[];
  saved: { id: string }[];
};
