import { logoPng } from "../helpers/logo";
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHash } from "node:crypto";
if (
  process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080" ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9099"
)
  throw new Error(
    "Use explicit localhost emulators for community E2E fixtures",
  );
const stamp = Date.now();
async function createCompany(page: Page, vi = false, name = "New UI company") {
  const search = page.getByRole("combobox", {
    name: vi ? "Tìm công ty" : "Find a company",
    exact: true,
  });
  await expect(search).toBeVisible();
  await expect(page.locator(".community-directory-loading")).toHaveCount(0);
  const more = page.getByRole("button", {
    name: vi ? "Tải thêm công ty" : "Load more companies",
    exact: true,
  });
  while (await more.isVisible()) {
    const count = await page.locator(".community-company-card").count();
    await more.click();
    await expect
      .poll(
        async () =>
          !(await more.isVisible()) ||
          (await page.locator(".community-company-card").count()) > count,
      )
      .toBe(true);
  }
  await search.click();
  await search.fill(name);
  await page
    .getByRole("option", {
      name: vi ? `Tạo công ty “${name}”` : `Create company “${name}”`,
      exact: true,
    })
    .click();
}
async function identity(page: Page, name: string) {
  return page.evaluate(async (email) => {
    const fixture = await import(
      /* @vite-ignore */ String(
        "/@fs/Users/hunpeo97/Desktop/Workspace/Coder/SatsunicCode/tests/e2e/fixtures/emulator-identity.ts",
      )
    );
    await fixture.createSyntheticIdentity(email);
    const { auth } = await import(
      /* @vite-ignore */ String("/src/firebase.ts")
    );
    return auth.currentUser.uid;
  }, `community-${stamp}-${name}@example.test`);
}
async function approve(page: Page, match: string) {
  await page.goto("/community/moderation");
  const article = page.locator("article").filter({ hasText: match });
  await expect(article).toHaveCount(1);
  await article.getByRole("button", { name: "Review and decide" }).click();
  const d = page.getByRole("dialog");
  await d
    .getByLabel("Reason · Visible to the contributor")
    .fill("Reviewed synthetic fixture content");
  await d.getByRole("button", { name: "Save decision" }).click();
  await expect(d).not.toBeVisible();
}
async function auditForm(
  page: Page,
  name: string,
  reopen: (vi: boolean) => Promise<void>,
) {
  for (const vi of [false, true]) {
    if (vi) {
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "Change language" }).click();
      await reopen(true);
    }
    const dialog = page.getByRole("dialog");
    for (const width of [360, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: width <= 390 ? 740 : 900 });
      await dialog.evaluate((el) => {
        el.scrollTop = 0;
      });
      const geometry = await dialog.evaluate((el) => {
        const bounds = el.getBoundingClientRect();
        const fields = [
          ...el.querySelectorAll<HTMLElement>(
            ".community-fields > .community-field",
          ),
        ]
          .filter((label) => label.getBoundingClientRect().width > 0)
          .map((label) => {
            const control = label.querySelector<HTMLElement>(
              "input,select,textarea",
            )!;
            return {
              top: label.getBoundingClientRect().top,
              controlTop: control.getBoundingClientRect().top,
              height: control.getBoundingClientRect().height,
            };
          });
        return {
          overflow: el.scrollWidth > el.clientWidth,
          left: bounds.left,
          right: bounds.right,
          fields,
        };
      });
      expect(geometry.overflow).toBe(false);
      expect(geometry.left).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(width);
      for (const field of geometry.fields)
        expect(Math.round(field.height * 100) / 100).toBeGreaterThanOrEqual(44);
      for (let i = 0; i < geometry.fields.length; i++) {
        for (const other of geometry.fields.slice(i + 1)) {
          if (Math.abs(other.top - geometry.fields[i]!.top) < 1) {
            expect(
              Math.abs(other.controlTop - geometry.fields[i]!.controlTop),
            ).toBeLessThan(1);
          }
        }
      }
      if (width === 390 || width === 1280) {
        await dialog.screenshot({
          path: `docs/evidence/form-${name}-${vi ? "vi" : "en"}-${width}.png`,
        });
      }
      await dialog.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await expect(dialog.locator(".community-dialog-head")).toBeInViewport();
      await expect(dialog.locator(".community-form-footer")).toBeInViewport();
      await expect(
        dialog.locator(".community-form-footer > button").last(),
      ).toBeInViewport();
      for (const button of await dialog
        .locator(".community-form-footer > button")
        .all()) {
        expect(
          Math.round((await button.boundingBox())!.height * 100) / 100,
        ).toBeGreaterThanOrEqual(44);
      }
    }
    const lastField = dialog
      .locator(
        ".community-field:visible input, .community-field:visible select, .community-field:visible textarea",
      )
      .last();
    await lastField.focus();
    await expect(lastField).toBeInViewport();
    const focusBounds = await lastField.boundingBox();
    const headBounds = await dialog
      .locator(".community-dialog-head")
      .boundingBox();
    const footerBounds = await dialog
      .locator(".community-form-footer")
      .boundingBox();
    expect(focusBounds!.y).toBeGreaterThanOrEqual(
      headBounds!.y + headBounds!.height - 1,
    );
    expect(focusBounds!.y + focusBounds!.height).toBeLessThanOrEqual(
      footerBounds!.y + 1,
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    if (vi) {
      await page.keyboard.press("Escape");
      await page
        .getByRole("button", { name: "Đổi giao diện sáng/tối" })
        .click();
      await reopen(true);
      await dialog.evaluate((el) => {
        el.scrollTop = 0;
      });
      await dialog.screenshot({
        path: `docs/evidence/form-${name}-vi-dark.png`,
      });
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.emulateMedia({ reducedMotion: "reduce" });
      expect(
        await dialog.evaluate((el) => getComputedStyle(el).animationName),
      ).toBe("none");
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.keyboard.press("Escape");
      await page
        .getByRole("button", { name: "Đổi giao diện sáng/tối" })
        .click();
      await reopen(true);
    }
  }
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Đổi ngôn ngữ" }).click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await reopen(false);
}
async function auditStepMotion(page: Page) {
  const dialog = page.getByRole("dialog");
  const heightBefore = (await dialog.boundingBox())!.height;
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  const panel = dialog.locator('[data-step="1"]');
  await expect(panel).toBeVisible();
  const frames = await panel.evaluate((el) =>
    el
      .getAnimations()
      .flatMap((a) => (a.effect as KeyframeEffect).getKeyframes()),
  );
  expect(frames.some((frame) => frame.transform === "translateX(12px)")).toBe(
    true,
  );
  expect((await dialog.boundingBox())!.height).toBeCloseTo(heightBefore, 0);
  await dialog.getByRole("button", { name: "Context", exact: true }).click();
  await expect(dialog.locator('[data-step="0"]')).toBeVisible();
  const reverseFrames = await dialog
    .locator('[data-step="0"]')
    .evaluate((el) =>
      el
        .getAnimations()
        .flatMap((a) => (a.effect as KeyframeEffect).getKeyframes()),
    );
  expect(
    reverseFrames.some((frame) => frame.transform === "translateX(-12px)"),
  ).toBe(true);
  expect(await panel.evaluate((el) => el.getAnimations().length)).toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      dialog
        .locator('[data-step="0"]')
        .evaluate((el) => el.getAnimations().length),
    )
    .toBe(0);
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  expect(await panel.evaluate((el) => el.getAnimations().length)).toBe(0);
  expect(
    await dialog
      .locator(".community-step-line > span")
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
  await dialog.getByRole("button", { name: "Context", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  // Close while a forward transition is running, then reopen with fresh private hydration.
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect
    .poll(() =>
      page
        .locator('dialog.community-dialog [data-step="1"]')
        .evaluate((el) => el.getAnimations().length),
    )
    .toBe(0);
  await page
    .getByRole("button", { name: "Write a review", exact: true })
    .first()
    .click();
  await expect(dialog.getByLabel("Experience year")).toBeEnabled();
  await dialog.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(() =>
      dialog
        .locator(".community-step-line > span")
        .evaluate((el) =>
          Number(getComputedStyle(el).transform.split("(")[1]?.split(",")[0]),
        ),
    )
    .toBeCloseTo(0.5, 2);
}
async function captureStep(page: Page, name: string, step: string) {
  const dialog = page.getByRole("dialog");
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: width === 390 ? 740 : 900 });
    await dialog.evaluate((el) => {
      el.scrollTop = 0;
    });
    expect(
      await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    await expect(
      dialog.locator(".community-form-footer > button").last(),
    ).toBeInViewport();
    await dialog.screenshot({
      path: `docs/evidence/form-${name}-${step}-${width}.png`,
    });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
}
test("community real UI → company suggestion → moderation → review → compensation → withdraw", async ({
  page,
  browser,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/companies");
  await identity(page, "owner");
  await page.reload();
  const name = `UI Company ${stamp}`,
    companyId = createHash("sha256")
      .update(`VN-${name.toLowerCase()}`)
      .digest("hex")
      .slice(0, 40);
  await createCompany(page);
  await auditForm(page, "company", async (vi) => {
    await createCompany(page, vi);
  });
  const d = page.getByRole("dialog");
  await d.getByLabel("Company name").fill(name);
  await d.getByLabel("Industry").fill("   ");
  await d.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(d.getByRole("alert")).toContainText(
    "Check the name, industry, logo, address and phone.",
  );
  await d.getByLabel("Industry").fill("Synthetic UI fixture");
  await d.getByRole("button", { name: "Continue", exact: true }).click();
  await d.getByLabel("Company logo", { exact: true }).setInputFiles({
    name: "logo.png",
    mimeType: "image/png",
    buffer: logoPng(),
  });
  await expect(d.getByAltText("Logo preview").first()).toBeVisible();
  await d
    .getByLabel("Headquarters address")
    .fill("12 Example Street, Hanoi, Vietnam");
  await d.getByLabel("Business phone").fill("+84 24 1234 5678");
  await d.getByLabel("Website · Optional").fill("https://example.test");
  await captureStep(page, "company", "details");
  const websiteField = d.getByLabel("Website · Optional");
  await websiteField.focus();
  await expect(websiteField).toBeInViewport();
  await expect
    .poll(async () => {
      const fieldBounds = await websiteField.boundingBox(),
        footerBounds = await d.locator(".community-form-footer").boundingBox();
      return fieldBounds!.y + fieldBounds!.height <= footerBounds!.y + 1;
    })
    .toBe(true);
  await d.getByRole("button", { name: "Preview", exact: true }).click();
  await captureStep(page, "company", "confirm");
  await d.getByRole("checkbox").check();
  await d.getByRole("button", { name: "Send for review", exact: true }).click();
  await expect(d).not.toBeVisible();
  await expect(page.getByRole("status")).toContainText(
    "Company profile sent and awaiting moderation.",
  );
  const mc = await browser.newContext(),
    mp = await mc.newPage();
  await mp.goto("/companies");
  const muid = await identity(mp, "moderator");
  const claimResponse = await mp.request.post(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/demo-satsuniccode/accounts:update",
    {
      headers: { Authorization: "Bearer owner" },
      data: {
        localId: muid,
        customAttributes: JSON.stringify({ communityModerator: true }),
      },
    },
  );
  expect(claimResponse.ok()).toBe(true);
  await mp.evaluate(async () => {
    const { auth } = await import(
      /* @vite-ignore */ String("/src/firebase.ts")
    );
    await auth.currentUser.getIdToken(true);
  });
  await approve(mp, name);
  await page.goto(`/companies/${companyId}`);
  await expect(
    page.getByText("12 Example Street, Hanoi, Vietnam", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("+84 24 1234 5678", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".community-logo img")).toBeVisible();
  await page
    .getByRole("button", { name: "Write a review", exact: true })
    .first()
    .click();
  const rd = page.getByRole("dialog");
  await expect(rd.getByLabel("Experience year")).toBeEnabled();
  await auditForm(page, "review", async (vi) => {
    await page
      .getByRole("button", {
        name: vi ? "Viết đánh giá" : "Write a review",
        exact: true,
      })
      .first()
      .click();
  });
  const role = rd.getByRole("combobox", { name: "Role family · Optional" });
  await role.fill("Staff frontend specialist");
  await expect(rd.getByRole("status")).toContainText(
    "No suggestions. You can enter a new value.",
  );
  await expect(role).toHaveValue("Staff frontend specialist");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await role.fill("Soft");
  await page.setViewportSize({ width: 390, height: 740 });
  await role.press("ArrowDown");
  const suggestions = rd.getByRole("listbox", {
    name: "Role family · Optional",
  });
  const popup = await suggestions.boundingBox(),
    head = await rd.locator(".community-dialog-head").boundingBox(),
    footer = await rd.locator(".community-form-footer").boundingBox();
  expect(popup!.y).toBeGreaterThanOrEqual(head!.y + head!.height - 1);
  expect(popup!.y + popup!.height).toBeLessThanOrEqual(footer!.y + 1);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await rd.screenshot({
    path: "docs/evidence/form-role-autocomplete-mobile.png",
  });
  await role.press("Enter");
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(role).toHaveValue("Software engineer");
  await role.press("ArrowDown");
  await role.press("Escape");
  await expect(rd).toBeVisible();
  await expect(role).toHaveAttribute("aria-expanded", "false");
  await auditStepMotion(page);
  await expect(
    rd.getByRole("button", { name: /Save draft|Lưu bản nháp/ }),
  ).toHaveCount(0);
  await rd.getByLabel("Headline").fill("Unsaved review headline");
  await page.keyboard.press("Escape");
  await expect(rd).not.toBeVisible();
  const draftLookup = "**/getOwnCommunityContribution";
  await page.route(draftLookup, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.continue();
  });
  await page
    .getByRole("button", { name: "Write a review", exact: true })
    .first()
    .click();
  await expect(rd.getByLabel("Experience year")).toBeDisabled();
  await expect(rd.getByLabel("Experience year")).toBeEnabled();
  await rd.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(rd.getByLabel("Headline")).toHaveValue(
    "Unsaved review headline",
  );
  await page.unroute(draftLookup);
  await rd.getByLabel("Headline").fill("An excellent team for learning");
  await rd
    .getByLabel("Positives / Positive experience")
    .fill("The team shares context and useful knowledge.");
  await rd
    .getByLabel("What could improve")
    .fill("Planning priorities should be clearer.");
  await captureStep(page, "review", "experience");
  await rd.getByRole("button", { name: "Preview", exact: true }).click();
  await captureStep(page, "review", "confirm");
  await expect(rd.locator('[aria-current="step"]')).toContainText("Review");
  await rd.getByRole("checkbox").check();
  await expect(rd.locator(".community-preview")).toContainText(
    "An excellent team",
  );
  await page.context().setOffline(true);
  await rd.getByRole("button", { name: "Send review", exact: true }).click();
  await expect(rd.getByRole("alert")).toBeVisible();
  await expect(rd.getByLabel("Headline")).toHaveValue(
    "An excellent team for learning",
  );
  await page.context().setOffline(false);
  await rd.getByRole("button", { name: "Send review", exact: true }).click();
  await expect(rd).not.toBeVisible();
  await approve(mp, "An excellent team for learning");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "An excellent team for learning" }),
  ).toBeVisible();
  await expect(page.locator(".community-rating-summary")).toContainText(
    "1 published reviews",
  );
  await page.screenshot({
    path: "docs/evidence/community-company-desktop.png",
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.goto(`/salaries?company=${companyId}`);
  const companyPicker = page.getByRole("combobox", {
    name: "Company",
    exact: true,
  });
  await companyPicker.fill(name);
  await companyPicker.press("ArrowDown");
  await companyPicker.press("Enter");
  await expect(companyPicker).toHaveValue(name);
  await page
    .getByRole("button", { name: "Contribute compensation", exact: true })
    .click();
  const sd = page.getByRole("dialog");
  await auditForm(page, "salary", async (vi) => {
    await page
      .getByRole("button", {
        name: vi ? "Đóng góp thu nhập" : "Contribute compensation",
        exact: true,
      })
      .click();
  });
  await sd.getByRole("button", { name: "Continue", exact: true }).click();
  await sd.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(sd.locator('[aria-current="step"]')).toContainText("Amounts");
  await sd.getByLabel("Amount per pay period").fill("30000000");
  await sd.getByLabel("Guaranteed pay periods per year").selectOption("13");
  await sd.getByLabel("Annual bonus", { exact: true }).fill("0");
  await sd.getByLabel("Annual vested equity").fill("0");
  await captureStep(page, "salary", "amounts");
  await sd.getByRole("button", { name: "Preview", exact: true }).click();
  await captureStep(page, "salary", "confirm");
  await expect(sd.locator('[aria-current="step"]')).toContainText("Review");
  await sd.getByRole("button", { name: "Back", exact: true }).click();
  await expect(sd.getByLabel("Amount per pay period")).toHaveValue("30000000");
  await sd.getByRole("button", { name: "Preview", exact: true }).click();
  await sd.getByRole("checkbox").check();
  await expect(sd.locator(".community-preview")).toContainText("390,000,000");
  await sd
    .getByRole("button", { name: "Send compensation", exact: true })
    .click();
  await expect(sd).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Not enough data to display" }),
  ).toBeVisible();
  await page.goto("/community/contributions");
  const reviewArticle = page
    .locator("article")
    .filter({ hasText: "An excellent team for learning" });
  await reviewArticle
    .getByRole("button", { name: "Withdraw", exact: true })
    .click();
  const wd = page.getByRole("dialog");
  await wd
    .getByRole("button", { name: "Withdraw contribution", exact: true })
    .click();
  await expect(wd).not.toBeVisible();
  await page.goto(`/companies/${companyId}`);
  await expect(
    page.getByRole("heading", { name: "An excellent team for learning" }),
  ).toHaveCount(0);
  await mc.close();
  expect(errors).toEqual([]);
});
test("guest company/salary/progress, mobile icons, dark mode and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/companies");
  await createCompany(page);
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Sign in to contribute" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Find a company", exact: true }),
  ).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: "docs/evidence/community-mobile.png",
    fullPage: true,
  });
  await page.goto("/salaries");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Toggle light/dark theme" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/progress");
  await expect(
    page.getByRole("button", { name: "Sign in with Google" }),
  ).toBeVisible();
});
