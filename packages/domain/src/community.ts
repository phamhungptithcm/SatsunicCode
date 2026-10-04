import type { ReviewInput, PublicReview } from "../../contracts/src/community";
/** Explicit allowlist: public records cannot inherit private metadata. */
export function publicReview(
  id: string,
  input: ReviewInput,
  helpful = 0,
): PublicReview {
  const {
    companyId,
    kind,
    employment,
    role,
    year,
    rating,
    cultureRating,
    growthRating,
    headline,
    pros,
    cons,
  } = input;
  return {
    id,
    companyId,
    kind,
    employment,
    role,
    year,
    rating,
    cultureRating,
    growthRating,
    headline,
    pros,
    cons,
    helpful,
    source: "SELF_REPORTED",
  };
}
export function companyKey(name: string, country: string) {
  return `${country}-${name.normalize("NFKC").toLocaleLowerCase("en").replace(/\s+/g, " ").trim()}`;
}
