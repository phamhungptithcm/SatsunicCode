import {test,expect} from '@playwright/test';
test('Home capsule, persistent page launcher and workspace exclusion',async({page})=>{
 await page.goto('/');await expect(page.locator('aside textarea')).toBeVisible();
 for(const route of ['/roadmaps/dsa','/practice','/projects','/progress','/settings','/account','/not-found']) {
  await page.goto(route);await expect(page.getByRole('button',{name:'Open Ask Satsunic'})).toBeVisible();await expect(page.locator('aside textarea')).toHaveCount(0);
 }
 await page.getByRole('button',{name:'Open Ask Satsunic'}).click();const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible();await dialog.locator('textarea').fill('Keep this draft');await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(page.getByRole('button',{name:'Open Ask Satsunic'})).toBeVisible();
 await page.getByRole('button',{name:'Open Ask Satsunic'}).click();await expect(dialog.locator('textarea')).toHaveValue('Keep this draft');await page.keyboard.press('Escape');
 await page.goto('/practice/contains-duplicate');await expect(page.getByRole('heading',{level:1})).toHaveText('Contains Duplicate');await expect(page.getByRole('button',{name:'Open Ask Satsunic'})).toHaveCount(0);await expect(page.locator('dialog[aria-labelledby=ask-satsunic-title]')).toHaveCount(0);
 await page.goto('/');await expect(page.locator('aside textarea')).toBeVisible();
});
