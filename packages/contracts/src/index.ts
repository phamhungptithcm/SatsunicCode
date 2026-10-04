import { z } from "zod/v3";
export const slugSchema = z.string().regex(/^[a-z0-9-]{1,80}$/);
export const enrollSchema = z
  .object({
    trackSlug: slugSchema,
    roadmapVersion: slugSchema,
    requestId: z.string().uuid(),
  })
  .strict();
export const draftSchema = z
  .object({
    source: z.string().max(100000),
    language: z.enum(["javascript", "typescript", "python", "java"]),
    challengeRevision: slugSchema,
    context: z.literal("learning"),
    revision: z.number().int().nonnegative(),
  })
  .strict();
export const assistantInputSchema = z
  .object({
    message: z.string().trim().min(1).max(8000),
    clientRequestId: z.string().uuid(),
    locale: z.enum(["vi", "en"]),
  })
  .strict();
export const assistantEventSchema = z
  .object({
    requestId: z.string().uuid(),
    sequence: z.number().int().nonnegative(),
    type: z.enum(["text_delta", "status", "final", "error"]),
    text: z.string().max(20000),
  })
  .strict();
export type Draft = z.infer<typeof draftSchema>;
export type AssistantEvent = z.infer<typeof assistantEventSchema>;

export const executionInputSchema = z
  .object({
    problemRevision: z.enum(["duplicate-check-v1", "peak-requests-v1"]),
    source: z.string().min(1).max(100000),
    language: z.enum(["javascript", "typescript", "python", "java"]),
    requestId: z.string().uuid(),
    mode: z.enum(["run", "submit"]),
    customInput: z.string().max(1000000).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.mode === "submit" && value.customInput !== undefined)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom input is only valid for Run.",
      });
  });
export type ExecutionInput = z.infer<typeof executionInputSchema>;
export * from "./community";
export * from "./progress";
