import {test,expect} from '@playwright/test';
test('shared chrome on pages, excluded only on code workspace; roadmap copy removed',async({page})=>{
 for(const route of ['/','/roadmaps','/roadmaps/dsa','/roadmaps/ai-engineer','/practice','/learn/arrays','/settings','/account','/account/saved','/account/submissions','/progress','/projects','/companies','/salaries','/interview-board','/org','/admin','/missing']){
  await page.goto(route);
  await expect(page.locator('.site-header')).toBeVisible();
  await expect(page.locator('.site-footer')).toBeVisible();
 }
 await page.goto('/roadmaps/dsa');
 await expect(page.getByText('Learning activity is not connected yet.',{exact:true})).toHaveCount(0);
 await expect(page.getByText('— means verified progress is unavailable; it does not claim zero solved.',{exact:true})).toHaveCount(0);
 await expect(page.locator('.dsa-about')).toHaveCount(0);
 for(const route of ['/practice/contains-duplicate','/practice/peak-requests']){
  await page.goto(route);
  await expect(page.locator('.site-header')).toHaveCount(0);
  await expect(page.locator('.site-footer')).toHaveCount(0);
 }
 await page.goto('/practice');
 await expect(page.locator('.site-header')).toBeVisible();
 await expect(page.locator('.site-footer')).toBeVisible();
});
