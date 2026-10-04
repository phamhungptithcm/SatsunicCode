import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const width of [1440, 390]) {
  test(`Ask capsule and dialog ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const input = page.locator("aside textarea");
    await input.fill("How do I practice arrays?");
    await input.press("Enter");
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
    await expect(dialog.getByRole("status")).toContainText(
      /unavailable|chưa khả dụng/,
    );
    const box = await dialog.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(input).toHaveValue("How do I practice arrays?");
    await expect(input).toBeFocused();
    await page.locator("aside button[type=button]").click();
    const launcher = page.getByRole("button", {
      name: /Open Ask Satsunic|Mở Ask Satsunic/,
    });
    await expect(launcher).toBeVisible();
    await launcher.click();
    await expect(input).toHaveValue("How do I practice arrays?");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await input.press("Enter");
    await expect(dialog).toBeVisible();
    expect(
      await dialog.evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
    const violations = (
      await new AxeBuilder({ page }).include("dialog[open]").analyze()
    ).violations;
    expect(violations).toEqual([]);
    await page.screenshot({ path: `docs/evidence/ask-satsunic-${width}.png` });
  });
}
test('dark theme, IME and backdrop drag guard', async ({page}) => {
 await page.setViewportSize({width:390,height:900});await page.goto('/');
 await page.evaluate(()=>document.body.dataset.theme='dark');
 const input=page.locator('aside textarea');await input.fill('Draft');
 await input.dispatchEvent('compositionstart');await input.press('Enter');await expect(page.locator('dialog[open]')).toHaveCount(0);await input.dispatchEvent('compositionend');const preserved=await input.inputValue();await input.press('Enter');
 const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible();await page.waitForTimeout(300);
 expect(await dialog.evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(26, 38, 64)');
 await page.mouse.move(100,150);await page.mouse.down();await page.mouse.move(2,2);await page.mouse.up();await expect(dialog).toBeVisible();
 await page.mouse.click(2,2);await expect(dialog).toHaveCount(0);await expect(input).toHaveValue(preserved);
 await input.press('Enter');await expect(dialog).toBeVisible();
 expect((await new AxeBuilder({page}).include('dialog[open]').analyze()).violations).toEqual([]);
 await page.screenshot({path:'docs/evidence/ask-satsunic-dark.png'});
});
test('measured HunpeoLabs motion and launcher hint', async ({page}) => {
 await page.goto('/');const input=page.locator('aside textarea');await input.fill('Motion');await input.press('Enter');
 const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible();
 expect(await dialog.evaluate(el=>el.getAnimations().some(a=>a.effect?.getTiming().duration===360))).toBe(true);
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
 await page.locator('aside button[type=button]').click();
 await expect(page.locator('[data-emerging]')).toBeVisible();
 const launcher=page.getByRole('button',{name:/Open Ask Satsunic|Mở Ask Satsunic/});await expect(launcher).toBeEnabled();
 await expect(page.locator('[data-hint]')).toBeVisible({timeout:8000});
 expect(await launcher.locator('span>span').count()).toBe(12);
});
