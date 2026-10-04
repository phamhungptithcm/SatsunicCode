import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('production UI checkpoint read-only',async({page})=>{
 const errors:string[]=[];const local:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/https?:\/\/(localhost|127\.0\.0\.1)/.test(r.url()))local.push(r.url());});
 await page.goto('/');await expect(page.locator('.home-dsa-node')).toHaveCount(18);
 const input=page.locator('aside textarea');await expect(input).toBeVisible();await input.fill('Draft kept locally');
 await page.locator('aside button[type=button]').click();await expect(page.getByRole('button',{name:'Open Ask Satsunic'})).toBeEnabled();await page.getByRole('button',{name:'Open Ask Satsunic'}).click();await expect(input).toHaveValue('Draft kept locally');
 await page.goto('/roadmaps/dsa');await expect(page.locator('.dsa-topic')).toHaveCount(18);
 await page.goto('/practice/contains-duplicate');await expect(page.getByRole('heading',{level:1})).toHaveText('Contains Duplicate');await expect(page.locator('.workspace-difficulty')).toHaveText('Easy');await expect(page.locator('.editor-toolbar')).toBeVisible();
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
 await page.screenshot({path:'docs/evidence/production-ui-20261004.png'});expect(errors).toEqual([]);expect(local).toEqual([]);
});
