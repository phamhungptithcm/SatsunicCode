import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const dark of [false, true])
  for (const width of [1440, 390]) {
    test(`workspace controls ${dark ? "dark" : "light"} ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((dark) => {
        localStorage.setItem("satsuniccode.locale", "en");
        localStorage.setItem("satsuniccode.editor", "textarea");
        localStorage.setItem("satsuniccode.theme", dark ? "dark" : "light");
      }, dark);
      await page.goto("/practice/contains-duplicate");
      const badge = page.locator(".workspace-difficulty");
      await expect(badge).toBeVisible();
      const header = page.locator(".workspace-tabs");
      const badgeBounds = await badge.boundingBox(),
        headerBounds = await header.boundingBox();
      expect(badgeBounds!.y).toBeGreaterThanOrEqual(headerBounds!.y);
      expect(badgeBounds!.x + badgeBounds!.width).toBeLessThanOrEqual(
        headerBounds!.x + headerBounds!.width,
      );
      const colors = await badge.evaluate((e) => {
        const initial = e.getAttribute("data-difficulty"),
          label = e.textContent;
        const values = ["Easy", "Medium", "Hard"].map((value) => {
          e.setAttribute("data-difficulty", value);
          e.textContent = value;
          const style = getComputedStyle(e);
          return [style.color, style.backgroundColor].join("/");
        });
        e.setAttribute("data-difficulty", initial!);
        e.textContent = label;
        return values;
      });
      expect(new Set(colors).size).toBe(3);
      if (width < 700)
        await page.getByRole("button", { name: "Code", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Run", exact: true }).locator("svg"),
      ).toHaveCount(1);
      await expect(
        page.getByRole("button", { name: "Undo reset", exact: true }),
      ).toBeDisabled();
      await expect(
        page
          .getByRole("button", { name: "Bookmark problem", exact: true })
          .locator("svg"),
      ).toHaveAttribute("aria-hidden", "true");
      const toolbar = page.locator(".editor-toolbar");
      expect((await toolbar.boundingBox())!.height).toBeLessThanOrEqual(
        width < 700 ? 100 : 60,
      );
      await expect(page.locator(".workspace-pane-control")).toHaveCount(0);
      const reset = page.getByRole("button", {
        name: "Reset code",
        exact: true,
      });
      await reset.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      expect(
        await reset.evaluate((e) => getComputedStyle(e, "::after").visibility),
      ).toBe("visible");
      await page.getByRole("button", { name: "Console", exact: false }).click();
      await expect(
        page.getByRole("button", { name: "Console", exact: false }),
      ).toHaveAttribute("aria-expanded", "true");
      const bounds = await page
        .getByRole("button", { name: "Submit", exact: true })
        .boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      await page.getByRole("button", { name: "Run", exact: true }).focus();
      expect(
        (
          await new AxeBuilder({ page })
            .include(".reference-workspace")
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.screenshot({
        path: `docs/evidence/workspace-controls-${dark ? "dark" : "light"}-${width}.png`,
        fullPage: true,
      });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const transition = await page
        .getByRole("button", { name: "Run", exact: true })
        .evaluate((e) => getComputedStyle(e).transitionDuration);
      expect(transition).toBe("0s");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    });
  }
test("Vietnamese controls preserve labels on narrow screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.addInitScript(() => {
    localStorage.setItem("satsuniccode.locale", "vi");
    localStorage.setItem("satsuniccode.editor", "textarea");
  });
  await page.goto("/practice/contains-duplicate");
  await page.getByRole("button", { name: "Viết mã", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Chạy", exact: true }).locator("svg"),
  ).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Đặt lại mã", exact: true }),
  ).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).include(".reference-workspace").analyze())
      .violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/evidence/workspace-controls-vi-390.png",
    fullPage: true,
  });
});
