import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base=process.argv[2];
if(!/^https:\/\/satsuniccode(?:--dsa-preview-[a-z0-9]+)?\.web\.app$/.test(base??''))throw Error('Approved satsuniccode Hosting URL required');
const manifest=JSON.parse(readFileSync('docs/evidence/hosting-candidate.json','utf8'));
const checks=[];
for(const artifact of manifest.artifacts){const r=await fetch(`${base}/${artifact.path}`);if(!r.ok)throw Error(`Hosted artifact HTTP${r.status}`);const hash=createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex');if(hash!==artifact.sha256)throw Error(`Candidate mismatch: ${artifact.path}`);checks.push({path:artifact.path,sha256:hash,matches:true});}
const apiKey=readFileSync('apps/web/.env.production.local','utf8').match(/^VITE_FIREBASE_API_KEY=(.+)$/m)?.[1];
if(!apiKey)throw Error('Verified public Firebase web config required');
const root='https://firestore.googleapis.com/v1/projects/satsuniccode/databases/(default)/documents';
const publicRead=await fetch(`${root}/dsaReferences/contains-duplicate?key=${encodeURIComponent(apiKey)}`);
const privateRead=await fetch(`${root}/users/production-smoke-nonexistent?key=${encodeURIComponent(apiKey)}`);
const evidence={base,artifactCount:checks.length,candidateMatches:true,publicReferenceHttp:publicRead.status,privateUserHttp:privateRead.status,checks};
writeFileSync('docs/evidence/hosted-candidate-verification.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({...evidence,checks:undefined}));
if(publicRead.status!==200||privateRead.status!==403)throw Error('Anonymous Firestore boundary not verified');
