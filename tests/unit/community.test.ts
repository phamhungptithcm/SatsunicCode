import { describe, it, expect } from "vitest";
import {
  reviewInput,
  reviewDraftInput,
} from "../../packages/contracts/src/community";
import { publicReview, companyKey } from "../../packages/domain/src/community";
export const review = {
  companyId: "company",
  kind: "EMPLOYEE" as const,
  employment: "CURRENT" as const,
  role: "Engineering",
  year: 2026,
  rating: 4,
  cultureRating: null,
  growthRating: null,
  headline: "Helpful team",
  pros: "People share knowledge",
  cons: "Planning could improve",
  acknowledged: true as const,
};
describe("review privacy and contracts", () => {
  it("incomplete private drafts do not satisfy publishable input", () => {
    const draft = {
      ...review,
      headline: "",
      pros: "",
      cons: "",
      acknowledged: false,
    };
    expect(reviewDraftInput.safeParse(draft).success).toBe(true);
    expect(reviewInput.safeParse(draft).success).toBe(false);
  });
  it("allowlists projection without private fields", () => {
    const p = publicReview("random-public-id", {
      ...review,
      ownerUid: "private",
      createdBy: "private",
      email: "private",
    } as typeof review);
    expect(Object.keys(p)).not.toContain("ownerUid");
    expect(JSON.stringify(p)).not.toContain("private");
    expect(p.helpful).toBe(0);
  });
  it("rejects additional fields, invalid rating and mixed interview state", () => {
    expect(reviewInput.safeParse({ ...review, ownerUid: "fake" }).success).toBe(
      false,
    );
    expect(reviewInput.safeParse({ ...review, rating: 0 }).success).toBe(false);
    expect(
      reviewInput.safeParse({ ...review, kind: "INTERVIEW" }).success,
    ).toBe(false);
    expect(
      reviewInput.safeParse({
        ...review,
        kind: "INTERVIEW",
        employment: "CANDIDATE",
        cultureRating: 4,
      }).success,
    ).toBe(false);
  });
  it("normalizes duplicate company keys", () =>
    expect(companyKey("  Example   COMPANY  ", "VN")).toBe(
      companyKey("Example Company", "VN"),
    ));
});
