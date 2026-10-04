import { describe, expect, it } from "vitest";
import { officialCompanyLogo } from "../../apps/web/src/features/community/officialCompanyLogos";
const fpt = {
  id: "cdd5c8d0763308fe1b73634158fa6f89cfa16839",
  name: "FPT Software",
  source: "OFFICIAL_DIRECTORY" as const,
  sourceUrl: "https://fptsoftware.com/en/about-us/global-presence",
};
describe("official directory logo identity", () => {
  it("does not assign official branding to a community suggestion or partial identity", () => {
    expect(
      officialCompanyLogo({ ...fpt, source: "COMMUNITY_SUGGESTION" }),
    ).toBe("");
    expect(officialCompanyLogo({ ...fpt, id: "other-company" })).toBe("");
    expect(officialCompanyLogo({ ...fpt, name: "Different company" })).toBe("");
    expect(
      officialCompanyLogo({ ...fpt, sourceUrl: "https://unrelated.example" }),
    ).toBe("");
    expect(officialCompanyLogo()).toBe("");
  });
  it("uses only a vetted same-origin asset for a fully matching company", () => {
    expect(officialCompanyLogo(fpt)).toBe("/company-logos/fpt-software.png");
  });
});
