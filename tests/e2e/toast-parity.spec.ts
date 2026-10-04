import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
// Development-only fixture exercises the real provider/component without Firebase writes.
test.beforeEach(async ({ page }) => { await page.goto("/@fs/Users/hunpeo97/Desktop/Workspace/Coder/SatsunicCode/tests/e2e/fixtures/toast/index.html"); });
test("kinds, single replacement, repeated messages and manual dismissal", async ({ page }) => {
  for (const kind of ["info", "success", "error", "warning"]) {
    await page.getByRole("button", { name: kind, exact: true }).click();
    await expect(page.locator(".satsunic-toast")).toHaveCount(1);
    await expect(page.locator(".satsunic-toast")).toHaveAttribute("data-kind", kind);
    await expect(page.getByRole(kind === "error" ? "alert" : "status")).toHaveText(`${kind} outcome`);
  }
  await page.getByRole("button", { name: "warning", exact: true }).click();
  await expect(page.locator(".satsunic-toast-time")).toHaveText("5s");
  await page.getByRole("button", { name: "Dismiss notification" }).click();
  await expect(page.locator(".satsunic-toast")).toHaveCount(0);
});
test("pending holds beyond five seconds and stale cleanup preserves success", async ({ page }) => {
  await page.getByRole("button", { name: "pending", exact: true }).click();
  await expect(page.locator(".satsunic-toast")).toHaveAttribute("aria-busy", "true");
  await expect(page.locator(".satsunic-toast-close")).toHaveCount(0);
  await page.waitForTimeout(5200);
  await expect(page.getByRole("status")).toHaveText("Saving snapshot");
  await expect(page.getByRole("status")).toHaveText("Snapshot saved");
});
test("focus/hover pause countdown, action and modal portal remain usable", async ({ page }) => {
  await page.getByRole("button", { name: "action", exact: true }).click();
  await page.getByRole("button", { name: "Keep draft" }).focus();
  await expect(page.locator(".satsunic-toast")).toHaveAttribute("data-paused", "true");
  await page.getByRole("button", { name: "Keep draft" }).click();
  await expect(page.getByRole("status")).toHaveText("Draft retained");
  await page.getByRole("button", { name: "Open dialog" }).click();
  await page.getByRole("button", { name: "Dialog toast" }).click();
  await expect(page.locator("dialog[open] .satsunic-toast")).toHaveCount(1);
  await page.locator(".satsunic-toast").hover();
  await expect(page.locator(".satsunic-toast")).toHaveAttribute("data-paused", "true");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator("body > .satsunic-toast")).toHaveCount(1);
});
test("mobile VI, reduced motion and accessible toast", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => localStorage.setItem("satsuniccode.locale", "vi"));
  await page.reload();
  await page.getByRole("button", { name: "error", exact: true }).click();
  await expect(page.getByRole("button", { name: "Ẩn thông báo" })).toBeVisible();
  expect(await page.locator(".satsunic-toast").evaluate(e => getComputedStyle(e).animationName)).toBe("none");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include(".satsunic-toast").analyze()).violations).toEqual([]);
});
