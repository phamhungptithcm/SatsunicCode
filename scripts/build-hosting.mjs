import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const config=readFileSync('apps/web/.env.production.local','utf8');
if(!/^VITE_FIREBASE_ENV=production$/m.test(config)||!/^VITE_FIREBASE_APP_ID=1:295420145391:web:/m.test(config))throw Error('Verified satsuniccode production SDK config required');
execFileSync('npm',['run','build','-w','apps/web'],{stdio:'inherit'});
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(`${dir}/${e.name}`):[`${dir}/${e.name}`]);}
const artifacts=files('apps/web/dist').map(path=>({path:path.replace('apps/web/dist/',''),sha256:createHash('sha256').update(readFileSync(path)).digest('hex')}));
const scripts=files('apps/web/dist').filter(p=>p.endsWith('.js')).map(p=>readFileSync(p,'utf8')).join('');
if(!scripts.includes('satsuniccode')||scripts.includes('hasRepeatedEvent'))throw Error('Production target/private evaluator bundle check failed');
writeFileSync('docs/evidence/hosting-candidate.json',JSON.stringify({projectId:'satsuniccode',artifacts,privateEvaluatorBundled:false,sourceMode:'production',readiness:'PARTIAL_HOSTING_ONLY'},null,2)+'\n');
