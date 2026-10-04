import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('DSA selector names and compact non-overlapping action',async({page})=>{
 await page.goto('/');await page.evaluate(async()=>{const fixture=await import(/* @vite-ignore */ String('/@fs/Users/hunpeo97/Desktop/Workspace/Coder/SatsunicCode/tests/e2e/fixtures/emulator-identity.ts'));await fixture.createSyntheticIdentity(`selector-${Date.now()}@example.test`);});
 await page.goto('/roadmaps/dsa');const select=page.locator('#dsa-set');const action=page.locator('.dsa-enroll-button');await expect(action).toBeVisible();
 expect(await select.locator('option').allTextContents()).toEqual(['Core 150','Essentials 75','All exercises (450)']);
 for(const width of [1440,390]) {await page.setViewportSize({width,height:900});await select.focus();const a=await select.boundingBox(),b=await action.boundingBox();expect(b!.y-(a!.y+a!.height)).toBeGreaterThanOrEqual(10);expect(b!.width).toBeCloseTo(a!.width,0);expect(b!.x+b!.width).toBeLessThanOrEqual(width);expect((await new AxeBuilder({page}).include('.dsa-summary').analyze()).violations).toEqual([]);}
 await select.selectOption('blind75');await expect(select).toHaveValue('blind75');await page.screenshot({path:'docs/evidence/dsa-selector-390.png'});
});
