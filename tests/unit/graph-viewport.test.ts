import { expect, test } from "vitest";
import { zoomAt } from "../../apps/web/src/hooks/useGraphViewport";
test("zoom preserves the graph coordinate under the gesture point at both scale bounds", () => {
  const v = { x: -130, y: 72, scale: 0.6 },
    p = { x: 410, y: 260 };
  for (const factor of [0.0001, 0.8, 1.2, 10000]) {
    const next = zoomAt(v, factor, p);
    expect(next.scale).toBeGreaterThanOrEqual(0.3);
    expect(next.scale).toBeLessThanOrEqual(1.6);
    expect((p.x - next.x) / next.scale).toBeCloseTo((p.x - v.x) / v.scale);
    expect((p.y - next.y) / next.scale).toBeCloseTo((p.y - v.y) / v.scale);
  }
});
