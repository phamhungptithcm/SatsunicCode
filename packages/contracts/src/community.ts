import { z } from "zod/v3";
export const idSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
const short = z.string().trim().min(1).max(100);
export const companyInput = z
  .object({ name: short, country: z.enum(["VN", "US"]), industry: short })
  .strict();
export const companyProfileInput = companyInput
  .extend({
    logoUploadId: z.string().uuid(),
    headquarters: z.string().trim().min(10).max(300),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9() .-]{8,25}$/)
      .refine((v) => {
        const digits = v.replace(/\D/g, "");
        return digits.length >= 8 && digits.length <= 15;
      }),
    website: z
      .string()
      .trim()
      .max(200)
      .refine((v) => {
        if (!v) return true;
        try {
          const u = new URL(v);
          return u.protocol === "https:" && !u.username && !u.password;
        } catch {
          return false;
        }
      }),
    acknowledged: z.literal(true),
  })
  .strict();
export type CompanyProfileInput = z.infer<typeof companyProfileInput>;
export const reviewInput = z
  .object({
    companyId: idSchema,
    kind: z.enum(["EMPLOYEE", "INTERVIEW"]),
    employment: z.enum(["CURRENT", "FORMER", "CANDIDATE"]),
    role: z.string().trim().max(80),
    year: z.number().int().min(2000).max(2100),
    rating: z.number().int().min(1).max(5),
    cultureRating: z.number().int().min(1).max(5).nullable(),
    growthRating: z.number().int().min(1).max(5).nullable(),
    headline: z.string().trim().min(5).max(140),
    pros: z.string().trim().min(10).max(2000),
    cons: z.string().trim().min(10).max(2000),
    acknowledged: z.literal(true),
  })
  .strict()
  .superRefine((v, ctx) => {
    if ((v.kind === "INTERVIEW") !== (v.employment === "CANDIDATE"))
      ctx.addIssue({
        code: "custom",
        message: "Experience and employment status do not match.",
      });
    if (
      v.kind === "INTERVIEW" &&
      (v.cultureRating !== null || v.growthRating !== null)
    )
      ctx.addIssue({
        code: "custom",
        message: "Interview ratings are separate from employment dimensions.",
      });
  });
export const reviewDraftInput = reviewInput
  .innerType()
  .extend({
    headline: z.string().trim().max(140),
    pros: z.string().trim().max(2000),
    cons: z.string().trim().max(2000),
    acknowledged: z.boolean(),
  })
  .strict();
export const salaryInput = z
  .object({
    companyId: idSchema,
    country: z.enum(["VN", "US"]),
    role: z.enum(["SOFTWARE_ENGINEER", "DATA_ENGINEER", "DESIGNER"]),
    level: z.enum(["JUNIOR", "MID", "SENIOR", "LEAD"]),
    experience: z.enum(["0_2", "3_5", "6_10", "11_PLUS"]),
    employmentType: z.enum(["FULL_TIME", "CONTRACT"]),
    currency: z.enum(["VND", "USD"]),
    basis: z.enum(["GROSS", "NET"]),
    year: z.number().int().min(2020).max(2100),
    base: z.number().finite().positive().max(1e12),
    period: z.enum(["MONTH", "YEAR"]),
    payPeriods: z.union([z.literal(12), z.literal(13), z.literal(1)]),
    bonus: z.number().finite().min(0).max(1e12).nullable(),
    bonusKind: z.enum(["ACTUAL", "TARGET"]),
    equity: z.number().finite().min(0).max(1e12).nullable(),
    equityKind: z.literal("ANNUAL_VESTED"),
    signOn: z.number().finite().min(0).max(1e12).nullable(),
    acknowledged: z.literal(true),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (
      (v.period === "YEAR" && v.payPeriods !== 1) ||
      (v.period === "MONTH" && v.payPeriods === 1)
    )
      ctx.addIssue({
        code: "custom",
        message: "Invalid guaranteed pay periods.",
      });
  });
const mutation = { requestId: z.string().uuid() };
const update = {
  id: idSchema.optional(),
  revision: z.number().int().nonnegative().optional(),
};
export const communityRequest = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("suggestCompany"),
      ...mutation,
      input: companyInput,
    })
    .strict(),
  z
    .object({
      action: z.literal("suggestCompanyProfile"),
      ...mutation,
      input: companyProfileInput,
    })
    .strict(),
  z
    .object({
      action: z.literal("saveReview"),
      ...mutation,
      ...update,
      input: reviewDraftInput,
      draft: z.boolean(),
    })
    .strict(),
  z
    .object({
      action: z.literal("saveSalary"),
      ...mutation,
      ...update,
      input: salaryInput,
    })
    .strict(),
  z
    .object({
      action: z.literal("withdraw"),
      ...mutation,
      kind: z.enum(["review", "salary"]),
      id: idSchema,
      revision: z.number().int().nonnegative(),
    })
    .strict(),
  z
    .object({
      action: z.literal("appeal"),
      ...mutation,
      id: idSchema,
      revision: z.number().int().nonnegative(),
      reason: z.string().trim().min(10).max(500),
    })
    .strict(),
  z.object({ action: z.literal("vote"), ...mutation, id: idSchema }).strict(),
  z
    .object({
      action: z.literal("report"),
      ...mutation,
      id: idSchema,
      reason: z.string().trim().min(10).max(500),
    })
    .strict(),
  z
    .object({
      action: z.literal("moderate"),
      ...mutation,
      kind: z.enum(["review", "salary", "company", "report"]),
      id: idSchema,
      revision: z.number().int().nonnegative(),
      decision: z.enum(["PUBLISHED", "REJECTED", "CHANGES_REQUESTED"]),
      reason: z.string().trim().min(5).max(500),
    })
    .strict(),
]);
export type ReviewInput = z.infer<typeof reviewInput>;
export type SalaryInput = z.infer<typeof salaryInput>;
export type Company = {
  id: string;
  name: string;
  country: "VN" | "US";
  industry: string;
  publicationState: "PUBLISHED";
  source: "COMMUNITY_SUGGESTION" | "OFFICIAL_DIRECTORY";
  sourceUrl?: string;
  researchedAt?: string;
  logoPath?: string;
  headquarters?: string;
  phone?: string;
  website?: string;
};
export type PublicReview = Pick<
  ReviewInput,
  | "companyId"
  | "kind"
  | "employment"
  | "role"
  | "year"
  | "rating"
  | "cultureRating"
  | "growthRating"
  | "headline"
  | "pros"
  | "cons"
> & { id: string; helpful: number; source: "SELF_REPORTED" };
export type ContributionStatus =
  | "DRAFT"
  | "PENDING_MODERATION"
  | "PUBLISHED"
  | "REJECTED"
  | "CHANGES_REQUESTED"
  | "REMOVED"
  | "APPEALED";
export type Contribution = {
  id: string;
  kind: "review" | "salary" | "company" | "report";
  revision: number;
  status: ContributionStatus;
  input:
    | ReviewInput
    | SalaryInput
    | CompanyProfileInput
    | z.infer<typeof companyInput>
    | { reviewId: string; reason: string };
  reason: string | null;
  logoUploadPath?: string;
  companyName?: string;
  reportedReview?: PublicReview | null;
};
export type SalaryStats = {
  available: boolean;
  countBand?: string;
  baseMedian?: number;
  baseP25?: number;
  baseP75?: number;
  recurringMedian?: number | null;
  currency?: string;
  basis?: string;
  year?: number;
  snapshotWeek?: number;
  source?: "SELF_REPORTED";
};
