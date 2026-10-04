import {test,expect} from '@playwright/test';
test('DSA sidebar closes on backdrop click and preserves inside click',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/roadmaps/dsa');
  await page.locator('.dsa-topic').first().click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('heading',{level:2}).click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(20,450);
  await expect(dialog).not.toBeVisible();
  await expect(page).not.toHaveURL(/topic=/);
  await page.locator('.dsa-topic').first().click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});
