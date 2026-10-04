import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("self-reported progress persists and resumes real lesson, keyboard/mobile/locale", async ({
  page,
}) => {
  await page.goto("/progress");
  await page.evaluate(async () => {
    const fixture = await import(
      /* @vite-ignore */ String(
        "/@fs/Users/hunpeo97/Desktop/Workspace/Coder/SatsunicCode/tests/e2e/fixtures/emulator-identity.ts",
      )
    );
    await fixture.createSyntheticIdentity(
      `progress-ui-${Date.now()}@example.test`,
    );
  });
  await page.reload();
  const status = page.getByLabel("Self-reported status · Arrays & Hashing");
  await status.selectOption("REVIEWED");
  await expect(
    page.getByRole("status").filter({ hasText: "Changes saved." }),
  ).toBeVisible();
  await page.reload();
  await expect(status).toHaveValue("REVIEWED");
  await page.goto("/learn/request-window");
  await expect
    .poll(async () =>
      page.evaluate(async () => {
        const { getProgress } = await import(
          /* @vite-ignore */ String("/src/features/community/api.ts")
        );
        return (await getProgress()).resume;
      }),
    )
    .toBe("/learn/request-window");
  await page.goto("/progress");
  await expect(
    page.getByRole("link", { name: "Continue learning", exact: true }),
  ).toHaveAttribute("href", "/learn/request-window");
  await expect(page.locator(".community-topic-row")).toHaveCount(18);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Change language" }).click();
  await expect(
    page.getByRole("heading", { name: "Việc học của tôi" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: "docs/evidence/progress-mobile.png",
    fullPage: true,
  });
  await page
    .getByLabel("Trạng thái tự ghi nhận · Arrays & Hashing")
    .selectOption("NOT_STARTED");
  await page.reload();
  await expect(
    page.getByLabel("Trạng thái tự ghi nhận · Arrays & Hashing"),
  ).toHaveValue("NOT_STARTED");
});
