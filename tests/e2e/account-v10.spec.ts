import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("guest entry has no Sign in page/button; preferences reuse existing shell", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Sign in", exact: true }),
  ).toHaveCount(0);
  await page.goto("/settings");
  await expect(
    page.getByRole("heading", { name: "Settings", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Start with SatsunicCode" }),
  ).toHaveCount(0);
  await expect(page.locator(".site-header")).toHaveCount(1);
  await expect(page.locator(".site-footer")).toHaveCount(1);
  await expect(
    page.locator("input[type=password],input[type=email]"),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await page.getByRole("button", { name: "Sáng", exact: true }).click();
  await page.reload();
  await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("synthetic emulator profile/menu, owned saved data and logout clearing; not Google OAuth", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const fixture = await import(
      /* @vite-ignore */ String(
        "/@fs/Users/hunpeo97/Desktop/Workspace/Coder/SatsunicCode/tests/e2e/fixtures/emulator-identity.ts",
      )
    );
    await fixture.createSyntheticIdentity(`v10-${Date.now()}@example.test`);
    await fixture.setSyntheticProfile("Emulator Learner");
  });
  await page.reload();
  const account = page.getByRole("button", { name: /Emulator Learner/ });
  await expect(account).toBeVisible();
  const caret = account.locator("svg.account-chevron");
  await expect(caret).toHaveAttribute("viewBox", "0 0 16 16");
  const centers = await account.evaluate((button) => {
    const avatar = button.querySelector(".user-avatar")!.getBoundingClientRect();
    const icon = button.querySelector("svg")!.getBoundingClientRect();
    return Math.abs(avatar.y + avatar.height / 2 - icon.y - icon.height / 2);
  });
  expect(centers).toBeLessThan(1);
  await account.click();
  await expect(caret).toHaveCSS("transform", "matrix(-1, 0, 0, -1, 0, 0)");
  await expect(page.locator(".account-popover")).toHaveCSS("animation-name", "community-menu-enter");
  await account.click();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await account.click();
  await page.locator("main").click({ position: { x: 5, y: 5 } });
  await expect(page.getByRole("menu")).toHaveCount(0);
  await account.focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("menuitem", { name: "My profile" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(account).toBeFocused();
  await expect(page.getByRole("menu")).not.toBeVisible();
  await account.click();
  await page.getByRole("menuitem", { name: "My profile" }).click();
  await expect(
    page.getByRole("heading", { name: "My profile", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Saved problems", exact: true }).click();
  await expect(page.getByText("You have no saved problems yet.")).toBeVisible();
  await page.goto("/practice/contains-duplicate");
  await page
    .getByRole("button", { name: "Bookmark problem", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Bookmark problem", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/account/saved");
  await expect(
    page.getByRole("link", { name: "Contains Duplicate", exact: true }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle light/dark theme", exact: true }).click();
  await expect(page.locator("body")).toHaveAttribute("data-theme", "dark");
  await account.click();
  await expect(caret).toHaveCSS("transition-duration", "0s");
  await expect(page.locator(".account-popover")).toHaveCSS("animation-name", "none");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/evidence/account-chevron-v12.png",
    fullPage: true,
  });
  await page.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  await expect(account).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Contains Duplicate", exact: true }),
  ).toHaveCount(0);
});
