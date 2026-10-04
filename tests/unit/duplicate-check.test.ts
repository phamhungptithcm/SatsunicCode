import { it, expect } from "vitest";
import { hasRepeatedEvent } from "../../content/private/duplicate-check-reference";
it("author duplicate-check matches independent pair comparison on deterministic inputs, preserves input", () => {
  let seed = 1234;
  for (let i = 0; i < 100; i++) {
    const data = Array.from({ length: i % 30 }, () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return (seed % 51) - 25;
    });
    const original = [...data];
    const brute = data.some((n, j) => data.slice(j + 1).includes(n));
    expect(hasRepeatedEvent(data)).toBe(brute);
    expect(data).toEqual(original);
  }
  expect(hasRepeatedEvent([-2147483648, 2147483647])).toBe(false);
  expect(() => hasRepeatedEvent([0.5])).toThrow();
});
