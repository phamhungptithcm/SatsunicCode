import { describe, it, expect } from "vitest";
import type { SalaryInput } from "../../packages/contracts/src/community";
import { salaryInput } from "../../packages/contracts/src/community";
import {
  normalizeSalary,
  cohortKey,
  salaryStats,
  safeSnapshot,
} from "../../packages/domain/src/compensation";
export const salary: SalaryInput = {
  companyId: "company",
  country: "VN",
  role: "SOFTWARE_ENGINEER",
  level: "MID",
  experience: "3_5",
  employmentType: "FULL_TIME",
  currency: "VND",
  basis: "GROSS",
  year: 2026,
  base: 30e6,
  period: "MONTH",
  payPeriods: 12,
  bonus: 0,
  bonusKind: "ACTUAL",
  equity: 0,
  equityKind: "ANNUAL_VESTED",
  signOn: 10e6,
  acknowledged: true,
};
describe("compensation normalization and privacy", () => {
  it("12/13 guaranteed periods, annual and sign-on stay distinct", () => {
    expect(normalizeSalary(salary)).toEqual({
      annualBase: 360e6,
      recurring: 360e6,
      firstYear: 370e6,
    });
    expect(normalizeSalary({ ...salary, payPeriods: 13 }).annualBase).toBe(
      390e6,
    );
    expect(
      normalizeSalary({ ...salary, base: 360e6, period: "YEAR", payPeriods: 1 })
        .annualBase,
    ).toBe(360e6);
  });
  it("unknown never equals zero and target never becomes actual", () => {
    expect(normalizeSalary({ ...salary, bonus: null }).recurring).toBeNull();
    expect(
      normalizeSalary({ ...salary, bonusKind: "TARGET" }).recurring,
    ).toBeNull();
    expect(normalizeSalary({ ...salary, signOn: null }).firstYear).toBeNull();
  });
  it("strict pay-period and amount schema", () => {
    expect(salaryInput.safeParse({ ...salary, payPeriods: 1 }).success).toBe(
      false,
    );
    expect(salaryInput.safeParse({ ...salary, period: "YEAR" }).success).toBe(
      false,
    );
    expect(salaryInput.safeParse({ ...salary, base: Infinity }).success).toBe(
      false,
    );
    expect(
      salaryInput.safeParse({ ...salary, equityKind: "TOTAL_GRANT" }).success,
    ).toBe(false);
  });
  it("partitions currencies/tax/year/employment and rejects mixed cohort aggregation", () => {
    expect(cohortKey(salary)).not.toBe(cohortKey({ ...salary, basis: "NET" }));
    const rows = Array.from({ length: 10 }, (_, i) => ({
      ownerUid: `u${i}`,
      input: salary,
    }));
    expect(() =>
      salaryStats(
        [
          ...rows,
          { ownerUid: "foreign", input: { ...salary, currency: "USD" } },
        ],
        10,
      ),
    ).toThrow("MIXED_COHORT");
  });
  it("suppresses nine/duplicate contributors; requires ten complete recurring values", () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({
      ownerUid: `u${i}`,
      input: salary,
    }));
    expect(salaryStats(rows.slice(0, 9), 10).available).toBe(false);
    expect(salaryStats([...rows.slice(0, 9), rows[0]!], 10).available).toBe(
      false,
    );
    expect(salaryStats(rows, 10)).toMatchObject({
      available: true,
      baseMedian: 360e6,
      countBand: "10–19",
    });
    expect(
      salaryStats(
        rows.map((r, i) =>
          i ? r : { ...r, input: { ...salary, bonus: null } },
        ),
        10,
      ).recurringMedian,
    ).toBeNull();
  });
  it("prevents one-member and same-week differencing", () => {
    const before = Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [`u${i}`, "old"]),
    );
    expect(safeSnapshot({}, before, undefined, 10)).toBe(true);
    expect(safeSnapshot(before, { ...before, u10: "new" }, 10, 11)).toBe(false);
    expect(
      safeSnapshot(
        before,
        Object.fromEntries(Object.keys(before).map((k) => [k, "new"])),
        10,
        10,
      ),
    ).toBe(false);
    expect(
      safeSnapshot(
        before,
        Object.fromEntries(Object.keys(before).map((k) => [k, "new"])),
        10,
        11,
      ),
    ).toBe(true);
  });
});
