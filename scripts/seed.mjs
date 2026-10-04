import { readFileSync } from "node:fs";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
if (
  process.env.GCLOUD_PROJECT !== "demo-satsuniccode" ||
  process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080"
)
  throw new Error("Seed is restricted to demo-satsuniccode local emulator");
initializeApp({ projectId: "demo-satsuniccode" });
await getFirestore()
  .doc("catalog/dsa-v1")
  .set({
    publicationState: "PUBLISHED",
    environment: "SYNTHETIC_EMULATOR_PREVIEW",
    contentReview: "CONTENT_REVIEW_REQUIRED",
    createdBy: "local-bootstrap",
    changedBy: "local-bootstrap",
    createdDate: FieldValue.serverTimestamp(),
    changedDate: FieldValue.serverTimestamp(),
    schemaVersion: 1,
  });
console.log(
  "Demo catalog seeded. No community records or accepted evidence created.",
);

const metadata=JSON.parse(readFileSync('content/reference/neetcode-catalog.json','utf8'));
const batch=getFirestore().batch();
for(const entry of metadata) batch.set(getFirestore().doc('dsaReferences/'+entry.slug),entry);
await batch.commit();
console.log('450 demo reference metadata records seeded; no content/verdict/user fabricated.');
