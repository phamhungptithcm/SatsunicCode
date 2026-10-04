import { describe, it, expect } from "vitest";
import { peakRequests } from "../../content/private/peak-requests-reference";
describe("original challenge reference — trusted author code, not sandbox execution", () => {
  it("checks empty, duplicates, exclusive boundary and long interval", () => {
    expect(peakRequests([], 5)).toBe(0);
    expect(peakRequests([1, 1, 1], 1)).toBe(3);
    expect(peakRequests([1, 4], 3)).toBe(1);
    expect(peakRequests([1, 2, 3, 10], 3)).toBe(3);
    expect(peakRequests([0, 1_000_000_000], 1_000_000_000)).toBe(1);
  });
  it("compares deterministic generated sorted fixtures to independent brute force", () => {
    let state = 42;
    const random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state;
    };
    for (let c = 0; c < 100; c++) {
      const input = Array.from(
          { length: random() % 50 },
          () => random() % 200,
        ).sort((a, b) => a - b),
        width = (random() % 20) + 1;
      const oracle = input.reduce(
        (max, t) =>
          Math.max(max, input.filter((v) => v >= t && v < t + width).length),
        0,
      );
      expect(peakRequests(input, width)).toBe(oracle);
    }
  });
  it("public fixture bank detects intentional inclusive-boundary and missing-duplicates mutations", () => {
    const fixtures = [
      { ts: [1, 4], w: 3, expected: 1 },
      { ts: [1, 1, 1], w: 1, expected: 3 },
    ];
    const wrongInclusive = (ts: number[], w: number) =>
      ts.reduce(
        (max, t) =>
          Math.max(max, ts.filter((v) => v >= t && v <= t + w).length),
        0,
      );
    const wrongDeduplicated = (ts: number[], w: number) =>
      peakRequests([...new Set(ts)], w);
    expect(fixtures.some((f) => wrongInclusive(f.ts, f.w) !== f.expected)).toBe(
      true,
    );
    expect(
      fixtures.some((f) => wrongDeduplicated(f.ts, f.w) !== f.expected),
    ).toBe(true);
  });
  it("rejects invalid author-side input", () => {
    expect(() => peakRequests([2, 1], 3)).toThrow();
    expect(() => peakRequests([1], 0)).toThrow();
  });
});
