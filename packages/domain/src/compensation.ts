import type { SalaryInput, SalaryStats } from "../../contracts/src/community";
export function normalizeSalary(v: SalaryInput) {
  const annualBase = v.base * v.payPeriods;
  return {
    annualBase,
    recurring:
      v.bonus !== null && v.equity !== null && v.bonusKind === "ACTUAL"
        ? annualBase + v.bonus + v.equity
        : null,
    firstYear:
      v.signOn !== null &&
      v.bonus !== null &&
      v.equity !== null &&
      v.bonusKind === "ACTUAL"
        ? annualBase + v.bonus + v.equity + v.signOn
        : null,
  };
}
/** Fixed disjoint cohorts. No roll-ups, arbitrary time/range filters or FX. */
export function cohortKey(
  v: Pick<
    SalaryInput,
    | "companyId"
    | "country"
    | "role"
    | "level"
    | "currency"
    | "basis"
    | "year"
    | "employmentType"
  >,
) {
  return [
    v.companyId,
    v.country,
    v.role,
    v.level,
    v.currency,
    v.basis,
    v.year,
    v.employmentType,
  ].join("_");
}
export function quantile(values: number[], q: number) {
  const a = [...values].sort((x, y) => x - y);
  if (!a.length) return null;
  const x = (a.length - 1) * q,
    lo = Math.floor(x),
    hi = Math.ceil(x);
  return a[lo]! + (a[hi]! - a[lo]!) * (x - lo);
}
export function salaryStats(
  rows: { ownerUid: string; input: SalaryInput }[],
  week: number,
): SalaryStats {
  const distinct = new Map(rows.map((r) => [r.ownerUid, r.input]));
  if (distinct.size < 10) return { available: false };
  const vals = [...distinct.values()],
    key = cohortKey(vals[0]!);
  if (vals.some((v) => cohortKey(v) !== key)) throw new Error("MIXED_COHORT");
  const rounding = vals[0]!.currency === "VND" ? 1e6 : 1000;
  const round = (v: number) => Math.round(v / rounding) * rounding;
  const base = vals.map((v) => normalizeSalary(v).annualBase),
    complete = vals
      .map((v) => normalizeSalary(v).recurring)
      .filter((v): v is number => v !== null);
  return {
    available: true,
    countBand: `${Math.floor(vals.length / 10) * 10}–${Math.floor(vals.length / 10) * 10 + 9}`,
    baseMedian: round(quantile(base, 0.5)!),
    baseP25: round(quantile(base, 0.25)!),
    baseP75: round(quantile(base, 0.75)!),
    recurringMedian:
      complete.length >= 10 ? round(quantile(complete, 0.5)!) : null,
    currency: vals[0]!.currency,
    basis: vals[0]!.basis,
    year: vals[0]!.year,
    snapshotWeek: week,
    source: "SELF_REPORTED",
  };
}
/** Publication needs ten distinct changed members since last release, not ten rows. */
export function safeSnapshot(
  previous: Record<string, string>,
  current: Record<string, string>,
  previousWeek: number | undefined,
  week: number,
) {
  if (previousWeek === week) return false;
  const changed = new Set(
    [...Object.keys(previous), ...Object.keys(current)].filter(
      (uid) => previous[uid] !== current[uid],
    ),
  );
  return Object.keys(current).length >= 10 && changed.size >= 10;
}
