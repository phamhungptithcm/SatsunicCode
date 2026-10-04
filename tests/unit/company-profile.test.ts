import { describe, it, expect } from "vitest";
import { validatedCompanyLogo } from "../../functions/src/company-logo";
import { companyProfileInput } from "../../packages/contracts/src/community";
import { logoPng } from "../helpers/logo";
const profile = {
  name: "Example",
  industry: "Software",
  country: "VN",
  logoUploadId: "cf2de531-cd17-4bf0-8297-6ddf82e0e62d",
  headquarters: "12 Example Street, Hanoi",
  phone: "+84 24 1234 5678",
  website: "https://example.test",
  acknowledged: true,
};
describe("company profile media and contract", () => {
  it("strips metadata and preserves valid bounded PNG", () => {
    expect(validatedCompanyLogo(logoPng(2, 2, true))).toEqual(logoPng());
  });
  it("rejects corrupt, oversized, truncated and disguised image data", () => {
    const corrupt = logoPng();
    corrupt[20] = corrupt[20]! ^ 1;
    for (const b of [
      corrupt,
      logoPng(1025, 2),
      logoPng().subarray(0, 40),
      Buffer.from("<svg/>"),
      Buffer.alloc(2097153),
    ])
      expect(() => validatedCompanyLogo(b)).toThrow();
  });
  it("requires complete, consented business profile", () => {
    expect(companyProfileInput.safeParse(profile).success).toBe(true);
    for (const patch of [
      { phone: "123" },
      { website: "http://example.test" },
      { website: "https://user:pass@example.test" },
      { headquarters: "x" },
      { acknowledged: false },
      { logoUploadId: "x" },
      { extra: true },
    ])
      expect(
        companyProfileInput.safeParse({ ...profile, ...patch }).success,
      ).toBe(false);
  });
});
