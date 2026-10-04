import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("configured production build loads real GIS on allowed localhost origin; no OAuth success claim", async ({
  page,
}) => {
  const origin = process.env.GOOGLE_TEST_ORIGIN ?? "http://localhost:5000";
  if (origin === "http://localhost:5173") {
    await page.goto("http://127.0.0.1:5173/settings?local=1");
    await expect(page).toHaveURL("http://localhost:5173/settings?local=1");
  }
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const gis = page.waitForResponse(
    (r) => r.url() === "https://accounts.google.com/gsi/client",
  );
  await page.goto(`${origin}/`);
  expect((await gis).status()).toBe(200);
  await expect(
    page.locator('script[src="https://accounts.google.com/gsi/client"]'),
  ).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Sign in", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("link", { name: "Practice", exact: true })
    .first()
    .click();
  await expect(
    page.locator('script[src="https://accounts.google.com/gsi/client"]'),
  ).toHaveCount(1);
  await page.goto(`${origin}/settings`);
  await expect(
    page.getByRole("heading", { name: "Settings", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("GOOGLE CONFIGURATION REQUIRED"),
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Show Google prompt again" }),
  ).toHaveCount(0);
  await expect(
    page.locator("input[type=email],input[type=password]"),
  ).toHaveCount(0);
  await expect(
    page.getByText("Signed in to your learning account."),
  ).not.toBeVisible();
  expect(errors).toEqual([]);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: "docs/evidence/google-one-tap-entry-v10.png",
    fullPage: true,
  });
});
