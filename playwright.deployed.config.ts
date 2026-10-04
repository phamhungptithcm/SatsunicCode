import {defineConfig} from '@playwright/test';
const baseURL=process.env.SATSUNIC_DEPLOY_URL;
if(!/^https:\/\/satsuniccode(?:--dsa-preview-[a-z0-9]+)?\.web\.app$/.test(baseURL??''))throw Error('Verified satsuniccode deployment URL required');
export default defineConfig({testDir:'./tests/deployed',workers:1,use:{baseURL,viewport:{width:1440,height:900}},reporter:[['list'],['json',{outputFile:'docs/evidence/deployed-browser-results.json'}]],timeout:30000});
