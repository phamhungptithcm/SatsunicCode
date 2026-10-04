import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("graph wheel, anchored zoom, node drag, pinch transition, keyboard and cancellation", async ({
  page,
}) => {
  await page.goto("/roadmaps/dsa");
  const canvas = page.locator(".dsa-canvas"),
    graph = page.locator(".dsa-graph");
  const matrix = () =>
    graph.evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return { x: m.e, y: m.f, z: m.a };
    });
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + 40, box.y + 40);
  await page.mouse.wheel(60, 100);
  await expect.poll(async () => (await matrix()).x).toBe(-60);
  await expect.poll(async () => (await matrix()).y).toBe(-100);
  const old = await matrix();
  await canvas.evaluate((el) =>
    el.dispatchEvent(
      new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        deltaY: -60,
        clientX: el.getBoundingClientRect().left + 200,
        clientY: el.getBoundingClientRect().top + 160,
      }),
    ),
  );
  await expect.poll(async () => (await matrix()).z).toBeGreaterThan(old.z);
  const next = await matrix();
  expect((199 - next.x) / next.z).toBeCloseTo((199 - old.x) / old.z, 3);
  expect((159 - next.y) / next.z).toBeCloseTo((159 - old.y) / old.z, 3);
  await page.getByRole("button", { name: "Reset graph", exact: true }).click();
  const node = page.locator(".dsa-topic").first();
  const nb = (await node.boundingBox())!;
  await page.mouse.move(nb.x + 30, nb.y + 20);
  await page.mouse.down();
  await page.mouse.move(nb.x + 90, nb.y + 60, { steps: 5 });
  await page.mouse.up();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await node.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Reset graph", exact: true }).click();
  // Browser-dispatched pointer gestures: not a physical trackpad/hardware claim.
  const cdp = await page.context().newCDPSession(page);
  const send = async (
    type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel",
    points: { id: number; x: number; y: number }[],
  ) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map((p) => ({
        ...p,
        x: p.x + box.x,
        y: p.y + box.y,
      })),
    });
  await send("touchStart", [
    { id: 51, x: 100, y: 100 },
    { id: 52, x: 200, y: 100 },
  ]);
  await send("touchMove", [
    { id: 51, x: 100, y: 100 },
    { id: 52, x: 260, y: 100 },
  ]);
  await expect.poll(async () => (await matrix()).z).toBeCloseTo(0.96, 2);
  await send("touchEnd", [{ id: 52, x: 260, y: 100 }]);
  const before = await matrix();
  await send("touchMove", [{ id: 51, x: 120, y: 130 }]);
  await expect
    .poll(async () => (await matrix()).x)
    .toBeCloseTo(before.x + 20, 2);
  await send("touchCancel", []);
  const cancelled = await matrix();
  await page.waitForTimeout(40);
  expect(await matrix()).toEqual(cancelled);
  await canvas.focus();
  await page.keyboard.press("0");
  await expect.poll(async () => (await matrix()).z).toBe(0.6);
  await page.keyboard.press("ArrowRight");
  await expect.poll(async () => (await matrix()).x).toBe(-40);
  await page.keyboard.press("+");
  await expect.poll(async () => (await matrix()).z).toBeGreaterThan(0.6);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: "docs/evidence/graph-gestures-v8.png" });
});

test('shift wheel and line-mode pan; wheel outside canvas does not change graph', async ({page}) => {
  await page.goto('/roadmaps/dsa');
  const canvas=page.locator('.dsa-canvas'), graph=page.locator('.dsa-graph');
  const x=()=>graph.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).e);
  await canvas.evaluate(el=>el.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,shiftKey:true,deltaY:2,deltaMode:1})));
  await expect.poll(x).toBe(-32);
  await page.locator('body').evaluate(el=>el.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,ctrlKey:true,deltaY:-100})));
  expect(await x()).toBe(-32);
  await expect(graph).toHaveCSS('transform', /matrix\(0.6, 0, 0, 0.6, -32, 0\)/);
});
