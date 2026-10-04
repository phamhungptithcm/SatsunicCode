import {test,expect} from '@playwright/test';
test('content transitions with stable shell and reduced motion',async({page})=>{
 await page.goto('/');const header=page.locator('.site-header');await expect(header).toBeVisible();
 const before=await header.boundingBox();await page.locator('.practice-text-link').click();await expect(page).toHaveURL(/\/practice$/);
 const content=page.locator('.page-transition');await expect(content).toBeVisible();
 expect(await content.evaluate(el=>getComputedStyle(el).animationName)).toBe('page-enter');expect(await content.evaluate(el=>getComputedStyle(el).animationDuration)).toBe('0.18s');
 expect((await header.boundingBox())!.y).toBe(before!.y);
 await page.emulateMedia({reducedMotion:'reduce'});expect(await content.evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
